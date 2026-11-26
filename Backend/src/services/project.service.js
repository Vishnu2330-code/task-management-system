const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const activityService = require('./activity.service');
const { canAccessProject, getProjectVisibilityQuery } = require('./project-visibility');

class ProjectService {
  /**
   * Check if user has permission to access a project
   */
  async checkProjectAccess(projectId, user) {
    const project = await Project.findById(projectId)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role department avatar');

    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    if (!(await canAccessProject(project, user))) {
      const err = new Error('Access denied. You are not a member or owner of this project.');
      err.statusCode = 403;
      throw err;
    }

    return project;
  }

  /**
   * Check if user has management permissions on project (Admin or Owner Manager)
   */
  async checkProjectManageAccess(projectId, user) {
    const project = await Project.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'admin') {
      return project;
    }

    if (user.role === 'manager' && project.owner.toString() === user._id.toString()) {
      return project;
    }

    const err = new Error('Forbidden: Only the project owner or an administrator can modify this project.');
    err.statusCode = 403;
    throw err;
  }

  /**
   * Create Project (Admin or Manager)
   */
  async createProject({ name, description, members = [] }, currentUser) {
    // Clean and validate members
    let memberIds = Array.isArray(members) ? members : [];
    if (!memberIds.includes(currentUser._id.toString())) {
      memberIds.push(currentUser._id);
    }

    const project = await Project.create({
      name,
      description,
      owner: currentUser._id,
      members: memberIds,
      status: 'active',
    });

    await activityService.logActivity({
      project: project._id,
      actor: currentUser._id,
      action: 'PROJECT_CREATED',
      details: `${currentUser.name} created project "${project.name}"`,
    });

    return Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role department avatar');
  }

  /**
   * Get Projects accessible by current user
   */
  async getProjects(currentUser, { search = '', status = '', page = 1, limit = 10 }) {
    const query = {};

    // Role-based visibility
    Object.assign(query, await getProjectVisibilityQuery(currentUser));

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      });
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('owner', 'name email role avatar')
        .populate('members', 'name email role department avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    // Attach task count summary to each project for rich UI card displays
    const projectIds = projects.map((p) => p._id);
    const taskMatch = { project: { $in: projectIds } };
    if (currentUser.role === 'member') {
      taskMatch.assignee = currentUser._id;
    }
    const taskStats = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          todoTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] },
          },
        },
      },
    ]);

    const statsMap = {};
    taskStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const enrichedProjects = projects.map((p) => ({
      ...p,
      taskMetrics: statsMap[p._id.toString()] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
      },
    }));

    return { projects: enrichedProjects, total, page, limit };
  }

  /**
   * Get Single Project by ID
   */
  async getProjectById(projectId, currentUser) {
    const project = await this.checkProjectAccess(projectId, currentUser);

    // Calculate project task summary
    const taskMatch = { project: project._id };
    if (currentUser.role === 'member') {
      taskMatch.assignee = currentUser._id;
    }
    const [taskMetrics] = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$project',
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          todoTasks: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        },
      },
    ]);

    return {
      ...project.toObject(),
      taskMetrics: taskMetrics || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
      },
    };
  }

  /**
   * Update Project (Admin or Owner Manager)
   */
  async updateProject(projectId, updateData, currentUser) {
    const project = await this.checkProjectManageAccess(projectId, currentUser);

    if (updateData.name !== undefined) project.name = updateData.name;
    if (updateData.description !== undefined) project.description = updateData.description;
    if (updateData.status !== undefined) project.status = updateData.status;
    if (Array.isArray(updateData.members)) {
      project.members = updateData.members;
    }

    await project.save();

    await activityService.logActivity({
      project: project._id,
      actor: currentUser._id,
      action: 'PROJECT_UPDATED',
      details: `${currentUser.name} updated project details`,
    });

    return Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role department avatar');
  }

  /**
   * Add Member to Project
   */
  async addMember(projectId, userId, currentUser) {
    const project = await this.checkProjectManageAccess(projectId, currentUser);

    const userToAdd = await User.findById(userId);
    if (!userToAdd || !userToAdd.isActive) {
      const err = new Error('User not found or is currently deactivated');
      err.statusCode = 404;
      throw err;
    }

    if (project.members.some((m) => m.toString() === userId.toString())) {
      const err = new Error('User is already a member of this project');
      err.statusCode = 409;
      throw err;
    }

    project.members.push(userId);
    await project.save();

    await activityService.logActivity({
      project: project._id,
      actor: currentUser._id,
      action: 'MEMBER_ADDED',
      details: `${currentUser.name} added ${userToAdd.name} (${userToAdd.role}) to project`,
      metadata: { addedUserId: userId },
    });

    return Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role department avatar');
  }

  /**
   * Remove Member from Project
   */
  async removeMember(projectId, userId, currentUser) {
    const project = await this.checkProjectManageAccess(projectId, currentUser);

    if (project.owner.toString() === userId.toString()) {
      const err = new Error('Cannot remove the project owner from project members');
      err.statusCode = 400;
      throw err;
    }

    const memberIndex = project.members.findIndex((m) => m.toString() === userId.toString());
    if (memberIndex === -1) {
      const err = new Error('User is not a member of this project');
      err.statusCode = 404;
      throw err;
    }

    const removedUser = await User.findById(userId);
    project.members.splice(memberIndex, 1);
    await project.save();

    await activityService.logActivity({
      project: project._id,
      actor: currentUser._id,
      action: 'MEMBER_REMOVED',
      details: `${currentUser.name} removed ${removedUser ? removedUser.name : 'member'} from project`,
      metadata: { removedUserId: userId },
    });

    return Project.findById(project._id)
      .populate('owner', 'name email role avatar')
      .populate('members', 'name email role department avatar');
  }

  /**
   * Delete Project (Admin or Owner Manager)
   */
  async deleteProject(projectId, currentUser) {
    const project = await this.checkProjectManageAccess(projectId, currentUser);

    const projectTasks = await Task.find({ project: project._id }).select('_id').lean();
    const taskIds = projectTasks.map((task) => task._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Activity.deleteMany({ project: project._id });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    return {
      success: true,
      message: 'Project and associated tasks, comments, and activities deleted successfully',
    };
  }
}

module.exports = new ProjectService();

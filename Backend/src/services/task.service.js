const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');
const activityService = require('./activity.service');
const {
  canAccessProject,
  getProjectVisibilityQuery,
  isProjectParticipant,
} = require('./project-visibility');

class TaskService {
  /**
   * Helper: Check if user has access to task's project
   */
  async checkProjectAccessForTask(projectId, user) {
    const project = await Project.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    if (!(await canAccessProject(project, user))) {
      const err = new Error('Access denied. You do not belong to this project.');
      err.statusCode = 403;
      throw err;
    }

    return project;
  }

  async checkTaskVisibility(task, user) {
    const projectId = task.project?._id || task.project;
    const project = await Project.findById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    const assigneeId = task.assignee?._id || task.assignee;
    const isAssigned = assigneeId?.toString() === user._id.toString();
    const canViewAllProjectTasks =
      user.role !== 'member' && isProjectParticipant(project, user);
    if (user.role !== 'admin' && !canViewAllProjectTasks && !isAssigned) {
      const err = new Error('Access denied. This task is not assigned to you.');
      err.statusCode = 403;
      throw err;
    }
    return project;
  }

  async checkProjectTaskManagementAccess(projectId, user) {
    const project = await this.checkProjectAccessForTask(projectId, user);
    if (user.role === 'manager' && !isProjectParticipant(project, user)) {
      const err = new Error('Forbidden: You must belong to this project to manage its tasks.');
      err.statusCode = 403;
      throw err;
    }
    return project;
  }

  /**
   * Create Task (Admin or Manager in authorized project)
   */
  async createTask(taskData, currentUser) {
    const { project: projectId, title, description, status, priority, assignee, dueDate, labels } = taskData;

    // Check project exists and user has management access to this project
    const project = await this.checkProjectTaskManagementAccess(projectId, currentUser);

    if (currentUser.role === 'member') {
      const err = new Error('Forbidden: Members cannot create new tasks. Only Managers or Admins can.');
      err.statusCode = 403;
      throw err;
    }

    // If assignee provided, verify assignee is member of project or exists
    let assigneeUser = null;
    if (assignee && currentUser.role !== 'member') {
      assigneeUser = await User.findById(assignee);
      if (!assigneeUser || !assigneeUser.isActive) {
        const err = new Error('Assigned user not found or is inactive');
        err.statusCode = 400;
        throw err;
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project: projectId,
      status: status || 'todo',
      priority: priority || 'med',
      assignee: assignee || null,
      creator: currentUser._id,
      dueDate: dueDate || null,
      labels: labels || [],
    });

    // Log Activity
    await activityService.logActivity({
      project: projectId,
      task: task._id,
      actor: currentUser._id,
      action: 'TASK_CREATED',
      details: `${currentUser.name} created task "${task.title}"`,
      metadata: { priority: task.priority, status: task.status },
    });

    return Task.findById(task._id)
      .populate('assignee', 'name email avatar role department')
      .populate('creator', 'name email avatar role')
      .populate('project', 'name');
  }

  /**
   * Get Tasks with Advanced Filtering, Sorting, and Pagination
   */
  async getTasks(currentUser, queryParams) {
    const {
      project: projectId,
      status,
      priority,
      assignee,
      label,
      search,
      overdue = false,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
      myTasks = false,
    } = queryParams;

    const query = {};
    let restrictToAssignee = currentUser.role === 'member';

    // Project filtering or global scope
    if (projectId) {
      if (currentUser.role === 'admin') {
        await this.checkProjectAccessForTask(projectId, currentUser);
      } else {
        const project = await Project.findById(projectId);
        if (!project) {
          const err = new Error('Project not found');
          err.statusCode = 404;
          throw err;
        }
        restrictToAssignee =
          restrictToAssignee || !isProjectParticipant(project, currentUser);
      }
      query.project = projectId;
    } else {
      // If no project specified, restrict non-admins to projects they can access
      if (currentUser.role !== 'admin') {
        if (currentUser.role === 'member') {
          query.assignee = currentUser._id;
        } else {
          const userProjects = await Project.find(
            await getProjectVisibilityQuery(currentUser)
          ).select('_id');
          query.$and = [
            ...(query.$and || []),
            {
              $or: [
                { project: { $in: userProjects.map((p) => p._id) } },
                { assignee: currentUser._id },
              ],
            },
          ];
        }
      }
    }

    // Filter by myTasks if requested
    if ((myTasks === 'true' || myTasks === true) && currentUser.role !== 'member') {
      query.assignee = currentUser._id;
    }

    if (status) {
      query.status = status;
    }

    if (overdue === 'true' || overdue === true) {
      query.$and = [
        ...(query.$and || []),
        { status: { $ne: 'done' } },
        { dueDate: { $ne: null, $lt: new Date() } },
      ];
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignee && currentUser.role !== 'member') {
      if (assignee === 'unassigned') {
        query.assignee = null;
      } else {
        query.assignee = assignee;
      }
    }

    if (label) {
      query.labels = label;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = [
        ...(query.$and || []),
        { $or: [{ title: searchRegex }, { description: searchRegex }] },
      ];
    }

    if (restrictToAssignee) {
      query.assignee = currentUser._id;
    }

    // Sorting
    const sortCriteria = {};
    const sortDirection = order === 'asc' ? 1 : -1;

    if (['dueDate', 'priority', 'createdAt', 'title', 'status'].includes(sortBy)) {
      sortCriteria[sortBy] = sortDirection;
    } else {
      sortCriteria.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email avatar role department')
        .populate('creator', 'name email avatar role')
        .populate('project', 'name')
        .sort(sortCriteria)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Task.countDocuments(query),
    ]);

    return { tasks, total, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  /**
   * Get Single Task by ID
   */
  async getTaskById(taskId, currentUser) {
    const task = await Task.findById(taskId)
      .populate('assignee', 'name email avatar role department phone')
      .populate('creator', 'name email avatar role')
      .populate('project', 'name');

    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    await this.checkTaskVisibility(task, currentUser);

    return task;
  }

  /**
   * Update Task (Full Update: Admin & Managers only)
   */
  async updateTask(taskId, updateData, currentUser) {
    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    await this.checkProjectTaskManagementAccess(task.project, currentUser);

    // Members cannot perform full update
    if (currentUser.role === 'member') {
      const err = new Error('Forbidden: Members can only update the status of tasks assigned to them.');
      err.statusCode = 403;
      throw err;
    }

    const previousAssignee = task.assignee ? task.assignee.toString() : null;
    const previousStatus = task.status;

    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.status !== undefined) task.status = updateData.status;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.dueDate !== undefined) task.dueDate = updateData.dueDate || null;
    if (updateData.labels !== undefined) task.labels = updateData.labels;
    if (updateData.order !== undefined) task.order = updateData.order;

    if (updateData.assignee !== undefined) {
      task.assignee = updateData.assignee || null;
    }

    await task.save();

    // Log Activity for Status Change
    if (updateData.status && updateData.status !== previousStatus) {
      await activityService.logActivity({
        project: task.project,
        task: task._id,
        actor: currentUser._id,
        action: 'STATUS_CHANGED',
        details: `${currentUser.name} changed status of "${task.title}" to ${task.status.replace('_', ' ').toUpperCase()}`,
        metadata: { from: previousStatus, to: task.status },
      });
    }

    // Log Activity for Reassignment
    const newAssigneeStr = task.assignee ? task.assignee.toString() : null;
    if (newAssigneeStr && newAssigneeStr !== previousAssignee) {
      const assignedUser = await User.findById(task.assignee);
      await activityService.logActivity({
        project: task.project,
        task: task._id,
        actor: currentUser._id,
        action: 'TASK_REASSIGNED',
        details: `${currentUser.name} assigned "${task.title}" to ${assignedUser ? assignedUser.name : 'member'}`,
        metadata: { previousAssignee, newAssignee: task.assignee },
      });
    }

    if (!updateData.status && !updateData.assignee) {
      await activityService.logActivity({
        project: task.project,
        task: task._id,
        actor: currentUser._id,
        action: 'TASK_UPDATED',
        details: `${currentUser.name} updated details of task "${task.title}"`,
      });
    }

    return Task.findById(task._id)
      .populate('assignee', 'name email avatar role department')
      .populate('creator', 'name email avatar role')
      .populate('project', 'name');
  }

  /**
   * Update Task Status (Members permitted ONLY if assigned to them)
   */
  async updateTaskStatus(taskId, newStatus, currentUser) {
    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    await this.checkTaskVisibility(task, currentUser);

    // Permission enforcement: Members can only update status of their own assigned tasks
    if (currentUser.role === 'member') {
      const isAssigned = task.assignee && task.assignee.toString() === currentUser._id.toString();
      if (!isAssigned) {
        const err = new Error('Forbidden: You can only update the status of tasks assigned to you.');
        err.statusCode = 403;
        throw err;
      }
    }

    const previousStatus = task.status;
    task.status = newStatus;
    await task.save();

    await activityService.logActivity({
      project: task.project,
      task: task._id,
      actor: currentUser._id,
      action: 'STATUS_CHANGED',
      details: `${currentUser.name} changed status of "${task.title}" from ${previousStatus.replace('_', ' ').toUpperCase()} to ${newStatus.replace('_', ' ').toUpperCase()}`,
      metadata: { from: previousStatus, to: newStatus },
    });

    return Task.findById(task._id)
      .populate('assignee', 'name email avatar role department')
      .populate('creator', 'name email avatar role')
      .populate('project', 'name');
  }

  /**
   * Delete Task (Admin or Managers only)
   */
  async deleteTask(taskId, currentUser) {
    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    await this.checkProjectTaskManagementAccess(task.project, currentUser);

    if (currentUser.role === 'member') {
      const err = new Error('Forbidden: Members cannot delete tasks.');
      err.statusCode = 403;
      throw err;
    }

    await activityService.logActivity({
      project: task.project,
      task: null,
      actor: currentUser._id,
      action: 'TASK_DELETED',
      details: `${currentUser.name} deleted task "${task.title}"`,
      metadata: { deletedTaskId: task._id, title: task.title },
    });

    // Delete comments for this task
    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);

    return { success: true, message: 'Task deleted successfully' };
  }
}

module.exports = new TaskService();


const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { canAccessProject, getProjectVisibilityQuery } = require('./project-visibility');

class DashboardService {
  /**
   * Get Summary Metrics tailored to role
   */
  async getSummary(currentUser) {
    const now = new Date();
    let visibleProjectIds = [];

    if (currentUser.role !== 'admin') {
      const userProjects = await Project.find(
        await getProjectVisibilityQuery(currentUser)
      ).select('_id');
      visibleProjectIds = userProjects.map((p) => p._id);
    }

    // Task aggregation for counts and status
    let taskMatch = {};
    if (currentUser.role === 'manager') {
      taskMatch = {
        $or: [
          { project: { $in: visibleProjectIds } },
          { assignee: currentUser._id },
        ],
      };
    } else if (currentUser.role === 'member') {
      taskMatch = { assignee: currentUser._id };
    }

    const [taskStats] = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          todoTasks: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'done'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          highPriorityTasks: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medPriorityTasks: { $sum: { $cond: [{ $eq: ['$priority', 'med'] }, 1, 0] } },
          lowPriorityTasks: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        },
      },
    ]);

    // Member-specific assigned task counts
    let myTasksStats = null;
    if (currentUser.role === 'member') {
      const [myStats] = await Task.aggregate([
        { $match: { assignee: currentUser._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$status', 'done'] },
                      { $ne: ['$dueDate', null] },
                      { $lt: ['$dueDate', now] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);
      myTasksStats = myStats || { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 };
    }

    // Projects count
    let totalProjects = 0;
    if (currentUser.role === 'admin') {
      totalProjects = await Project.countDocuments();
    } else {
      totalProjects = await Project.countDocuments(
        await getProjectVisibilityQuery(currentUser)
      );
    }

    // User counts for admin
    let userStats = null;
    if (currentUser.role === 'admin') {
      const [uStats] = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            managers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
            members: { $sum: { $cond: [{ $eq: ['$role', 'member'] }, 1, 0] } },
          },
        },
      ]);
      userStats = uStats || { totalUsers: 0, activeUsers: 0, admins: 0, managers: 0, members: 0 };
    }

    // Recent upcoming deadlines (due in next 7 days, not completed)
    const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlinesQuery = {
      ...taskMatch,
      status: { $ne: 'done' },
      dueDate: { $gte: now, $lte: next7Days },
    };

    const upcomingTasks = await Task.find(upcomingDeadlinesQuery)
      .populate('project', 'name')
      .populate('assignee', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(5)
      .lean();

    return {
      tasks: taskStats || {
        totalTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        highPriorityTasks: 0,
        medPriorityTasks: 0,
        lowPriorityTasks: 0,
      },
      totalProjects,
      ...(userStats && { userStats }),
      ...(myTasksStats && { myTasksStats }),
      upcomingTasks,
    };
  }

  /**
   * Get Member Workload Breakdown
   */
  async getMemberWorkload(currentUser, projectId = null) {
    const now = new Date();
    const match = {};

    if (projectId) {
      match.project = new mongoose.Types.ObjectId(projectId);
      const project = await Project.findById(projectId)
        .populate('owner', 'role')
        .populate('members', '_id');
      if (!project || !(await canAccessProject(project, currentUser))) {
        const err = new Error(project ? 'Access denied to this project.' : 'Project not found');
        err.statusCode = project ? 403 : 404;
        throw err;
      }
    } else if (currentUser.role !== 'admin') {
      const userProjects = await Project.find(
        await getProjectVisibilityQuery(currentUser)
      ).select('_id');
      if (currentUser.role === 'member') {
        match.assignee = currentUser._id;
      } else {
        match.$or = [
          { project: { $in: userProjects.map((p) => p._id) } },
          { assignee: currentUser._id },
        ];
      }
    }

    if (currentUser.role === 'member') {
      match.assignee = currentUser._id;
    }

    const taskMatch = {
      ...match,
      assignee:
        currentUser.role === 'member' ? currentUser._id : { $ne: null },
    };
    const workload = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$assignee',
          totalTasks: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'done'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          avatar: '$user.avatar',
          role: '$user.role',
          department: '$user.department',
          totalTasks: 1,
          todo: 1,
          inProgress: 1,
          done: 1,
          overdue: 1,
          completionRate: {
            $cond: [
              { $gt: ['$totalTasks', 0] },
              { $round: [{ $multiply: [{ $divide: ['$done', '$totalTasks'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { totalTasks: -1 } },
    ]);

    return workload;
  }

  /**
   * Get Project-Level In-Depth Statistics
   */
  async getProjectStats(projectId, currentUser) {
    const project = await Project.findById(projectId)
      .populate('owner', 'role')
      .populate('members', '_id');
    if (!project) {
      const err = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }
    if (!(await canAccessProject(project, currentUser))) {
      const err = new Error('Access denied to this project.');
      err.statusCode = 403;
      throw err;
    }

    const now = new Date();
    const pId = new mongoose.Types.ObjectId(projectId);

    const projectTaskMatch = { project: pId };
    if (currentUser.role === 'member') {
      projectTaskMatch.assignee = currentUser._id;
    }
    const [statusStats] = await Task.aggregate([
      { $match: projectTaskMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'done'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
          med: { $sum: { $cond: [{ $eq: ['$priority', 'med'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        },
      },
    ]);

    const memberWorkload = await this.getMemberWorkload(currentUser, projectId);

    return {
      project: {
        _id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
      },
      stats: statusStats || {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        overdue: 0,
        low: 0,
        med: 0,
        high: 0,
      },
      memberWorkload,
    };
  }
}

module.exports = new DashboardService();


const Activity = require('../models/Activity');
const Task = require('../models/Task');

class ActivityService {
  /**
   * Log an activity
   */
  async logActivity({ project, task = null, actor, action, details, metadata = {} }) {
    try {
      return await Activity.create({
        project,
        task,
        actor,
        action,
        details,
        metadata,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[Activity Service Error] Failed to log activity:', err.message);
      return null;
    }
  }

  /**
   * Get project activity timeline with pagination
   */
  async getProjectActivity(projectId, { page = 1, limit = 20, action = null }, currentUser) {
    const query = { project: projectId };
    if (action) {
      query.action = action;
    }

    if (currentUser.role === 'member') {
      const taskIds = await Task.find({
        project: projectId,
        assignee: currentUser._id,
      }).distinct('_id');
      query.$and = [
        { $or: [{ task: null }, { task: { $in: taskIds } }] },
        { action: { $ne: 'TASK_DELETED' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('actor', 'name email avatar role')
        .populate('task', 'title status priority')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Activity.countDocuments(query),
    ]);

    return { activities, total, page, limit };
  }
}

module.exports = new ActivityService();


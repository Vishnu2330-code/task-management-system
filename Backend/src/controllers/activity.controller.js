const activityService = require('../services/activity.service');
const projectService = require('../services/project.service');
const { paginatedResponse } = require('../utils/apiResponse');

class ActivityController {
  /**
   * Get Project Activity Timeline
   */
  async getProjectActivity(req, res, next) {
    try {
      const { id: projectId } = req.params;
      const { page = 1, limit = 20, action } = req.query;

      // Access verification
      await projectService.checkProjectAccess(projectId, req.user);

      const result = await activityService.getProjectActivity(projectId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        action,
      }, req.user);

      return paginatedResponse(res, 200, 'Activity timeline retrieved successfully', result.activities, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ActivityController();


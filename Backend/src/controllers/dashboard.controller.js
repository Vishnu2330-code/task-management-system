const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/apiResponse');

class DashboardController {
  /**
   * Get Role-Aware Dashboard Summary
   */
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary(req.user);
      return successResponse(res, 200, 'Dashboard summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Member Workload Breakdown
   */
  async getMemberWorkload(req, res, next) {
    try {
      const { projectId } = req.query;
      const workload = await dashboardService.getMemberWorkload(req.user, projectId);
      return successResponse(res, 200, 'Member workload retrieved successfully', { workload });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get In-Depth Project Statistics
   */
  async getProjectStats(req, res, next) {
    try {
      const { projectId } = req.params;
      const stats = await dashboardService.getProjectStats(projectId, req.user);
      return successResponse(res, 200, 'Project statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();


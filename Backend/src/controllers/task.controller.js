const taskService = require('../services/task.service');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

class TaskController {
  /**
   * Create Task (Admin or Manager)
   */
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.body, req.user);
      return successResponse(res, 201, 'Task created successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Tasks (with filtering, sorting, pagination)
   */
  async getTasks(req, res, next) {
    try {
      const result = await taskService.getTasks(req.user, req.query);
      return paginatedResponse(res, 200, 'Tasks retrieved successfully', result.tasks, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single Task by ID
   */
  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user);
      return successResponse(res, 200, 'Task retrieved successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Full Task Update (Admin or Manager)
   */
  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(req.params.id, req.body, req.user);
      return successResponse(res, 200, 'Task updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Task Status (Member permitted if assigned, or Manager/Admin)
   */
  async updateTaskStatus(req, res, next) {
    try {
      const { status } = req.body;
      const task = await taskService.updateTaskStatus(req.params.id, status, req.user);
      return successResponse(res, 200, 'Task status updated successfully', { task });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Task (Admin or Manager)
   */
  async deleteTask(req, res, next) {
    try {
      const result = await taskService.deleteTask(req.params.id, req.user);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();


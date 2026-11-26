const projectService = require('../services/project.service');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

class ProjectController {
  /**
   * Create Project (Admin or Manager)
   */
  async createProject(req, res, next) {
    try {
      const { name, description, members } = req.body;
      const project = await projectService.createProject(
        { name, description, members },
        req.user
      );
      return successResponse(res, 201, 'Project created successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Projects accessible by current user
   */
  async getProjects(req, res, next) {
    try {
      const { search = '', status = '', page = 1, limit = 10 } = req.query;
      const result = await projectService.getProjects(req.user, {
        search,
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return paginatedResponse(res, 200, 'Projects retrieved successfully', result.projects, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single Project by ID
   */
  async getProjectById(req, res, next) {
    try {
      const project = await projectService.getProjectById(req.params.id, req.user);
      return successResponse(res, 200, 'Project retrieved successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Project (Admin or Owner Manager)
   */
  async updateProject(req, res, next) {
    try {
      const project = await projectService.updateProject(req.params.id, req.body, req.user);
      return successResponse(res, 200, 'Project updated successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add Member to Project
   */
  async addMember(req, res, next) {
    try {
      const { userId } = req.body;
      const project = await projectService.addMember(req.params.id, userId, req.user);
      return successResponse(res, 200, 'Member added to project successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove Member from Project
   */
  async removeMember(req, res, next) {
    try {
      const { userId } = req.body;
      const project = await projectService.removeMember(req.params.id, userId, req.user);
      return successResponse(res, 200, 'Member removed from project successfully', { project });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Project (Admin or Owner Manager)
   */
  async deleteProject(req, res, next) {
    try {
      const result = await projectService.deleteProject(req.params.id, req.user);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProjectController();


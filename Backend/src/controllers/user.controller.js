const userService = require('../services/user.service');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

class UserController {
  /**
   * Get Users (Admin only)
   */
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', role = '', isActive = '' } = req.query;
      const result = await userService.getUsers({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        role,
        isActive,
      });

      return paginatedResponse(res, 200, 'Users retrieved successfully', result.users, {
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Single User by ID
   */
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return successResponse(res, 200, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Create User
   */
  async createUser(req, res, next) {
    try {
      const { name, email, password, role, department } = req.body;
      const user = await userService.createUser({ name, email, password, role, department });
      return successResponse(res, 201, 'User created successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Update User
   */
  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return successResponse(res, 200, 'User updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin permanently deletes a user
   */
  async deleteUser(req, res, next) {
    try {
      const result = await userService.deleteUser(req.params.id, req.user._id);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Self Profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, phone, department, bio, avatar } = req.body;
      const user = await userService.updateProfile(req.user._id, {
        name,
        phone,
        department,
        bio,
        avatar,
      });
      return successResponse(res, 200, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Available Project Members (for assignment dropdowns)
   */
  async getProjectMembers(req, res, next) {
    try {
      const members = await userService.getProjectMembersForUser(req.user);
      return successResponse(res, 200, 'Members retrieved successfully', { members });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

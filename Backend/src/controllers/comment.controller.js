const commentService = require('../services/comment.service');
const { successResponse } = require('../utils/apiResponse');

class CommentController {
  /**
   * Add Comment or Reply
   */
  async createComment(req, res, next) {
    try {
      const { content, task, parentComment } = req.body;
      const comment = await commentService.createComment(
        {
          taskId: task,
          content,
          parentCommentId: parentComment,
        },
        req.user
      );
      return successResponse(res, 201, 'Comment added successfully', { comment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Comments for Task (with threaded replies)
   */
  async getTaskComments(req, res, next) {
    try {
      const { taskId } = req.params;
      const comments = await commentService.getTaskComments(taskId, req.user);
      return successResponse(res, 200, 'Comments retrieved successfully', { comments });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Comment
   */
  async updateComment(req, res, next) {
    try {
      const { content } = req.body;
      const comment = await commentService.updateComment(req.params.id, content, req.user);
      return successResponse(res, 200, 'Comment updated successfully', { comment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Comment
   */
  async deleteComment(req, res, next) {
    try {
      const result = await commentService.deleteComment(req.params.id, req.user);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();


const Comment = require('../models/Comment');
const Task = require('../models/Task');
const activityService = require('./activity.service');
const taskService = require('./task.service');

class CommentService {
  /**
   * Create Comment or Reply (1-level threaded)
   */
  async createComment({ taskId, content, parentCommentId = null }, currentUser) {
    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    // Access check
    await taskService.checkTaskVisibility(task, currentUser);

    let finalParentCommentId = null;
    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent) {
        const err = new Error('Parent comment not found');
        err.statusCode = 404;
        throw err;
      }
      // Enforce 1-level threading:
      // If parent itself has a parentComment, point to the root parent
      finalParentCommentId = parent.parentComment ? parent.parentComment : parent._id;
    }

    const comment = await Comment.create({
      content,
      task: taskId,
      author: currentUser._id,
      parentComment: finalParentCommentId,
    });

    // Log Activity
    await activityService.logActivity({
      project: task.project,
      task: task._id,
      actor: currentUser._id,
      action: 'COMMENT_ADDED',
      details: `${currentUser.name} commented on "${task.title}"`,
      metadata: { commentId: comment._id, isReply: !!finalParentCommentId },
    });

    return Comment.findById(comment._id).populate('author', 'name email avatar role');
  }

  /**
   * Get Comments for Task structured with 1-level replies
   */
  async getTaskComments(taskId, currentUser) {
    const task = await Task.findById(taskId);
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    await taskService.checkTaskVisibility(task, currentUser);

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 })
      .lean();

    // Organize into top-level comments and replies
    const topLevelComments = [];
    const replyMap = {};

    comments.forEach((c) => {
      if (c.parentComment) {
        const parentId = c.parentComment.toString();
        if (!replyMap[parentId]) {
          replyMap[parentId] = [];
        }
        replyMap[parentId].push(c);
      } else {
        topLevelComments.push(c);
      }
    });

    const structuredComments = topLevelComments.map((root) => ({
      ...root,
      replies: replyMap[root._id.toString()] || [],
    }));

    return structuredComments;
  }

  /**
   * Update Comment (Author only)
   */
  async updateComment(commentId, content, currentUser) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      const err = new Error('Comment not found');
      err.statusCode = 404;
      throw err;
    }

    const task = await Task.findById(comment.task);
    if (task) {
      await taskService.checkTaskVisibility(task, currentUser);
    }

    if (comment.author.toString() !== currentUser._id.toString()) {
      const err = new Error('Forbidden: You can only edit your own comments');
      err.statusCode = 403;
      throw err;
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    return Comment.findById(comment._id).populate('author', 'name email avatar role');
  }

  /**
   * Delete Comment (Author, Admin, or Project Manager)
   */
  async deleteComment(commentId, currentUser) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      const err = new Error('Comment not found');
      err.statusCode = 404;
      throw err;
    }

    const task = await Task.findById(comment.task);
    const project = task
      ? await taskService.checkTaskVisibility(task, currentUser)
      : null;
    const isAuthor = comment.author.toString() === currentUser._id.toString();
    const isAdmin = currentUser.role === 'admin';

    let isManager = false;
    if (project && currentUser.role === 'manager') {
      if (project.owner.toString() === currentUser._id.toString()) {
        isManager = true;
      }
    }

    if (!isAuthor && !isAdmin && !isManager) {
      const err = new Error('Forbidden: Insufficient permissions to delete this comment');
      err.statusCode = 403;
      throw err;
    }

    // Also delete replies if this is a parent comment
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(comment._id);

    return { success: true, message: 'Comment and replies removed successfully' };
  }
}

module.exports = new CommentService();


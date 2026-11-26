const { body, param } = require('express-validator');

const createCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 2000 })
    .withMessage('Comment content cannot exceed 2000 characters'),
  body('task')
    .notEmpty()
    .withMessage('Task ID is required')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  body('parentComment')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid parent comment ID format'),
];

const updateCommentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID parameter'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Updated comment content cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Comment content cannot exceed 2000 characters'),
];

const commentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid comment ID parameter'),
];

module.exports = {
  createCommentValidator,
  updateCommentValidator,
  commentIdParamValidator,
};


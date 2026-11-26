const { body, param } = require('express-validator');

const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 120 })
    .withMessage('Project name cannot exceed 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array of user IDs'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member user ID format'),
];

const updateProjectValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID parameter'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 120 }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'completed'])
    .withMessage('Status must be active, archived, or completed'),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array of user IDs'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member user ID format'),
];

const projectIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID format'),
];

const manageMemberValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid project ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
  manageMemberValidator,
};


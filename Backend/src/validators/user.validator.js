const { body, param, query } = require('express-validator');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Role must be admin, manager, or member'),
  body('department')
    .optional()
    .trim(),
];

const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID parameter'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 }),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Role must be admin, manager, or member'),
  body('department')
    .optional()
    .trim(),
];

const userIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  userIdParamValidator,
};

const { body } = require('express-validator');

const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .custom((value) => {
      if (value === 'admin') {
        throw new Error('Public registration cannot create Admin accounts');
      }
      if (!['manager', 'member'].includes(value)) {
        throw new Error('Role must be either manager or member');
      }
      return true;
    }),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('portalRole')
    .optional()
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Invalid portal role identifier'),
];

const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

const resetPasswordValidator = [
  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

module.exports = {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator,
};


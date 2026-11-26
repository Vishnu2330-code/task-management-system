const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

// Public Auth Endpoints (Rate Limited)
router.post('/signup', authLimiter, signupValidator, validate, authController.signup);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);

// Protected Auth Endpoints
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword);

module.exports = router;


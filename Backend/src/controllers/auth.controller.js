const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const env = require('../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: env.jwt.refreshExpiresInMs,
  path: '/',
};

const accessCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 mins
  path: '/',
};

class AuthController {
  /**
   * User Signup
   */
  async signup(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.signup({ name, email, password, role });
      return successResponse(res, 201, 'Account registered successfully. You can now log in.', {
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User Login (Admin, Manager, Member portals)
   */
  async login(req, res, next) {
    try {
      const { email, password, portalRole } = req.body;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';

      const { user, accessToken, refreshToken } = await authService.login({
        email,
        password,
        portalRole,
        userAgent,
        ipAddress,
      });

      // Set HttpOnly refresh token cookie
      res.cookie('refreshToken', refreshToken, cookieOptions);
      res.cookie('accessToken', accessToken, accessCookieOptions);

      return successResponse(res, 200, 'Login successful', {
        user,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Token Rotation
   */
  async refreshToken(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';

      if (!rawRefreshToken) {
        return errorResponse(res, 401, 'No refresh token provided in cookie or payload');
      }

      const { user, accessToken, refreshToken } = await authService.refreshTokens(
        rawRefreshToken,
        userAgent,
        ipAddress
      );

      // Rotate cookies
      res.cookie('refreshToken', refreshToken, cookieOptions);
      res.cookie('accessToken', accessToken, accessCookieOptions);

      return successResponse(res, 200, 'Token refreshed successfully', {
        user,
        accessToken,
      });
    } catch (error) {
      // Clear cookie on failure
      res.clearCookie('refreshToken', cookieOptions);
      res.clearCookie('accessToken', accessCookieOptions);
      next(error);
    }
  }

  /**
   * User Logout
   */
  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (rawRefreshToken) {
        await authService.logout(rawRefreshToken);
      }

      res.clearCookie('refreshToken', cookieOptions);
      res.clearCookie('accessToken', accessCookieOptions);

      return successResponse(res, 200, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot Password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      return successResponse(res, 200, result.message, {
        ...(result.resetToken && { resetToken: result.resetToken }),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      if (!token) {
        return errorResponse(res, 400, 'Password reset token is required');
      }

      const result = await authService.resetPassword(token, password);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  async getMe(req, res, next) {
    try {
      return successResponse(res, 200, 'User profile retrieved successfully', {
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change Password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();


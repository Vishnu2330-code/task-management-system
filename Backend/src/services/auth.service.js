const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} = require('../utils/jwt');
const env = require('../config/env');
const logger = require('../utils/logger');

class AuthService {
  /**
   * User Signup
   */
  async signup({ name, email, password, role = 'member' }) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('An account with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    // Guard against public admin signup
    const finalRole = role === 'admin' ? 'member' : (role || 'member');

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: finalRole,
      isActive: true,
    });

    return user;
  }

  /**
   * User Login with Role Validation
   */
  async login({ email, password, portalRole, userAgent = '', ipAddress = '' }) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Your account has been deactivated. Please contact an administrator.');
      err.statusCode = 403;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    // Role-specific login portal verification:
    // If a user tries logging in through Admin Login but is a Member, guide them with a clear error
    if (portalRole && user.role !== portalRole) {
      const err = new Error(
        `Access denied. You attempted to log in via the ${portalRole.toUpperCase()} portal, but your account has the '${user.role}' role.`
      );
      err.statusCode = 403;
      throw err;
    }

    // Generate token family ID
    const familyId = crypto.randomUUID();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, familyId);

    // Save hashed refresh token in database
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInMs);

    await RefreshToken.create({
      user: user._id,
      tokenHash,
      family: familyId,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh Token Rotation with Reuse Detection
   */
  async refreshTokens(rawRefreshToken, userAgent = '', ipAddress = '') {
    if (!rawRefreshToken) {
      const err = new Error('No refresh token provided');
      err.statusCode = 401;
      throw err;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(rawRefreshToken);
    } catch (error) {
      const err = new Error('Invalid or expired refresh token');
      err.statusCode = 401;
      throw err;
    }

    const rawTokenHash = hashToken(rawRefreshToken);

    // Find the token document
    const tokenDoc = await RefreshToken.findOne({ tokenHash: rawTokenHash });

    // REUSE DETECTION: If token does not exist or has already been revoked
    if (!tokenDoc || tokenDoc.isRevoked) {
      logger.warn(`[SECURITY ALERT] Refresh token reuse detected for user ID: ${decoded.id}, family: ${decoded.familyId}`);
      // Invalidate all tokens belonging to this family (or user) immediately!
      if (decoded.familyId) {
        await RefreshToken.updateMany(
          { user: decoded.id, family: decoded.familyId },
          { $set: { isRevoked: true } }
        );
      }
      const err = new Error('Security alert: Refresh token reuse detected. All active sessions invalidated.');
      err.statusCode = 403;
      throw err;
    }

    // Verify token has not expired
    if (tokenDoc.expiresAt < new Date()) {
      tokenDoc.isRevoked = true;
      await tokenDoc.save();
      const err = new Error('Refresh token has expired. Please sign in again.');
      err.statusCode = 401;
      throw err;
    }

    const user = await User.findById(tokenDoc.user);
    if (!user || !user.isActive) {
      const err = new Error('User no longer active or found');
      err.statusCode = 401;
      throw err;
    }

    // Issue new tokens using the same family
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, tokenDoc.family);
    const newTokenHash = hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + env.jwt.refreshExpiresInMs);

    // Invalidate old token and link to new one
    tokenDoc.isRevoked = true;
    tokenDoc.replacedByTokenHash = newTokenHash;
    await tokenDoc.save();

    // Create new token record
    await RefreshToken.create({
      user: user._id,
      tokenHash: newTokenHash,
      family: tokenDoc.family,
      expiresAt: newExpiresAt,
      userAgent,
      ipAddress,
    });

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout - Revoke the refresh token
   */
  async logout(rawRefreshToken) {
    if (!rawRefreshToken) return true;

    try {
      const tokenHash = hashToken(rawRefreshToken);
      await RefreshToken.updateOne({ tokenHash }, { $set: { isRevoked: true } });
    } catch (err) {
      logger.warn('Error during logout token revocation:', err.message);
    }
    return true;
  }

  /**
   * Request Password Reset
   */
  async forgotPassword(email) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Return success anyway to avoid user enumeration
      return { success: true, message: 'If an account exists, a reset link has been dispatched.' };
    }

    // Invalidate previous unused reset tokens for this user
    await PasswordResetToken.updateMany({ user: user._id, isUsed: false }, { $set: { isUsed: true } });

    // Generate random token
    const rawResetToken = generateRandomToken(32);
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + env.resetPasswordExpiresMinutes * 60 * 1000);

    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt,
      isUsed: false,
    });

    logger.info(`[Password Reset] Reset token generated for ${email}: ${rawResetToken}`);

    return {
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken: rawResetToken, // Returned for easy testing and local environment demo
    };
  }

  /**
   * Reset Password with Token
   */
  async resetPassword(rawToken, newPassword) {
    const tokenHash = hashToken(rawToken);

    const tokenDoc = await PasswordResetToken.findOne({
      tokenHash,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      const err = new Error('Invalid or expired password reset token');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(tokenDoc.user);
    if (!user) {
      const err = new Error('Associated user not found');
      err.statusCode = 404;
      throw err;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark reset token as used
    tokenDoc.isUsed = true;
    await tokenDoc.save();

    // Invalidate all active refresh tokens for security
    await RefreshToken.updateMany({ user: user._id }, { $set: { isRevoked: true } });

    return { success: true, message: 'Password has been successfully reset. Please log in with your new password.' };
  }

  /**
   * Change Password (for logged in user)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const err = new Error('Incorrect current password');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    await user.save();

    // Revoke other sessions
    await RefreshToken.updateMany({ user: user._id }, { $set: { isRevoked: true } });

    return { success: true, message: 'Password changed successfully.' };
  }
}

module.exports = new AuthService();


const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Generate Access Token (short-lived, 15m)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id: payload._id || payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
};

/**
 * Generate Refresh Token (long-lived, 7d)
 */
const generateRefreshToken = (payload, familyId) => {
  return jwt.sign(
    {
      id: payload._id || payload.id,
      familyId,
      random: crypto.randomBytes(16).toString('hex'),
    },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};

/**
 * SHA-256 Hash for Token Storage
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate random hex token (for password reset)
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
};


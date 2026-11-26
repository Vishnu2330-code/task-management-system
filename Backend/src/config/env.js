const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/task_management_db',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_should_be_changed',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_should_be_changed',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refreshExpiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cookieSecret: process.env.COOKIE_SECRET || 'cookie_secret_fallback',
  resetPasswordExpiresMinutes: parseInt(process.env.RESET_PASSWORD_EXPIRES_IN_MINUTES, 10) || 30,
};


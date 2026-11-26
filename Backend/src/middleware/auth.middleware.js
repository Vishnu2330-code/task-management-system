const { verifyAccessToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies fallback
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication required. No token provided.');
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Access token expired. Please refresh your session.');
      }
      return errorResponse(res, 401, 'Invalid access token.');
    }

    // Find user in database
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};


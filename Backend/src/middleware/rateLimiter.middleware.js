const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'Too many requests from this IP address, please try again after 15 minutes.');
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      429,
      'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
    );
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};


const { errorResponse } = require('../utils/apiResponse');
const env = require('../config/env');
const logger = require('../utils/logger');

// Not Found Handler
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `Cannot ${req.method} ${req.originalUrl} - Route not found`);
};

// Global Centralized Error Handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource ID parameter format: '${err.value}'`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `Duplicate key violation: A record with ${field} '${value}' already exists.`;
    errors = [{ field, message: `${field} is already in use` }];
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token signature.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  }

  // Differentiate between 4xx operational errors and 500 unhandled errors
  if (statusCode >= 500) {
    logger.error('Unhandled Application Error:', err);
  } else {
    logger.warn(`Operational Request Error [${statusCode}] on ${req.method} ${req.originalUrl}: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(!env.isProduction && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};


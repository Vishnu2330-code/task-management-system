/**
 * Standardized API Response Utilities
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors }),
  };
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, statusCode = 200, message = 'Success', data = [], pagination = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      hasNextPage: pagination.page < Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
      hasPrevPage: pagination.page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};


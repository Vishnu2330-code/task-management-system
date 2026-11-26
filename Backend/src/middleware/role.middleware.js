const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based Access Control Middleware
 * @param  {...string} allowedRoles - 'admin', 'manager', 'member'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized. Please sign in first.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}]`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};


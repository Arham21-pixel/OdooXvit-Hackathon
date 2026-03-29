const { sendError } = require('../utils/response');

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

module.exports = { allowRoles };

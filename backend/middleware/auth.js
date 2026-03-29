const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

const requireAuth = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route', 401);
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return sendError(res, 'Token is invalid or expired', 401);
  }

  req.user = decoded; // { id, role, company_id }
  next();
};

module.exports = { requireAuth };

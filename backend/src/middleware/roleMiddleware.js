import { error } from "../utils/response.js";

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return error(res, "Not authenticated.", 401);
    if (!allowedRoles.includes(req.user.role_name)) {
      return error(res, "Access denied. Insufficient permissions.", 403);
    }
    next();
  };
};

export default authorize;

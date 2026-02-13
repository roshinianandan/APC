import { AppError } from "../utils/AppError.js";

export const requireRole = (...allowed) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowed.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};

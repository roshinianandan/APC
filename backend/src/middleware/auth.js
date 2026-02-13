import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const JWT_SECRET = "super-secret-key"; // ✅ local hardcoded

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) throw new AppError("Not authorized, token missing", 401);

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.sub).select("-password");
    if (!user) throw new AppError("User not found", 401);

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// ✅ backward compatibility: if some routes still use { auth }
export const auth = requireAuth;

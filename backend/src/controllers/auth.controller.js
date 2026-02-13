import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_SECRET = "super-secret-key"; // hardcoded (no env)
const JWT_EXPIRES_IN = "7d";

// ✅ Admin protection code (type this in frontend when role=admin)
const ADMIN_REGISTER_CODE = "ADMIN123";

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    department,
    adminRegisterCode // ✅ comes from frontend only for admin
  } = req.body;

  const emailNorm = String(email || "").toLowerCase().trim();
  if (!name || !emailNorm || !password || !role || !department) {
    throw new AppError("name, email, password, role, department are required", 400);
  }

  // ✅ Prevent random admin creation
  if (role === "admin") {
    if (!adminRegisterCode) throw new AppError("Admin register code required", 400);
    if (adminRegisterCode !== ADMIN_REGISTER_CODE) {
      throw new AppError("Invalid admin register code", 403);
    }
  }

  const exists = await User.findOne({ email: emailNorm });
  if (exists) throw new AppError("Email already exists", 409);

  const hash = await bcrypt.hash(String(password), 10);

  const user = await User.create({
    name,
    email: emailNorm,
    password: hash,
    role,
    department,
    isActive: true
  });

  const accessToken = signToken(user);

  res.status(201).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").toLowerCase().trim();
  const password = String(req.body.password || "");

  if (!email || !password) throw new AppError("Email and password are required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("Invalid credentials", 401);

  if (user.isActive === false) throw new AppError("Account disabled", 403);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const accessToken = signToken(user);

  res.json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    }
  });
});

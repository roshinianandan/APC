import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({ success: true, users });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department } = req.body;

  const emailNorm = String(email || "").toLowerCase().trim();

  const exists = await User.findOne({ email: emailNorm });
  if (exists) throw new AppError("Email already exists", 409);

  const hash = await bcrypt.hash(String(password), 10);

  const user = await User.create({
    name,
    email: emailNorm,
    password: hash, // ✅ hashed stored in "password"
    role,
    department,
    isActive: true
  });

  res.status(201).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    }
  });
});

export const setUserActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findById(id);
  if (!user) throw new AppError("User not found", 404);

  user.isActive = Boolean(isActive);
  await user.save();

  res.json({
    success: true,
    user: {
      id: user._id,
      isActive: user.isActive
    }
  });
});

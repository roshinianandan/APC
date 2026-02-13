import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // You currently store hash in "password" (based on your DB screenshot)
    password: { type: String, required: true },

    role: { type: String, enum: ["student", "faculty", "admin"], default: "student" },
    department: { type: String, default: "" },

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

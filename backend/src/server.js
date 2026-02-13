import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import studentsRoutes from "./routes/students.routes.js";
import recordsRoutes from "./routes/records.routes.js";
import clusteringRoutes from "./routes/clustering.routes.js";

const app = express();

// ---------- MIDDLEWARE ----------
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend is running ✅" });
});

// ✅ HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/clustering", clusteringRoutes);

// ---------- 404 HANDLER ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  // Mongo duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server error"
  });
});

// ---------- DB + SERVER ----------
mongoose
  .connect("mongodb://127.0.0.1:27017/minis6")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () =>
      console.log("🚀 Server running on http://localhost:5000")
    );
  })
  .catch((err) => console.error("MongoDB error:", err.message));

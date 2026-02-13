import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import studentsRoutes from "./routes/students.routes.js";
import recordsRoutes from "./routes/records.routes.js";
import clusteringRoutes from "./routes/clustering.routes.js";

import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// security + parsing
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

// cors
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);

// rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

// ✅ health route (must return JSON)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ✅ mount API routes (IMPORTANT)
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/clustering", clusteringRoutes);

// 404 + error
app.use(notFound);
app.use(errorHandler);

export default app;

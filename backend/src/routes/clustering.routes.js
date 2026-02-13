import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { runClustering, latestRun } from "../controllers/clustering.controller.js";

const router = Router();

router.post("/run", requireAuth, requireRole("faculty", "admin"), runClustering);
router.get("/latest", requireAuth, requireRole("faculty", "admin"), latestRun);

export default router;

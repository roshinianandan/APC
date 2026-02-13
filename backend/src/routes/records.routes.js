import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  upsertRecord,
  listRecords,
  myRecord,
  myCluster,
  deleteRecord
} from "../controllers/records.controller.js";

const router = express.Router();

// ✅ faculty/admin
// ✅ NOW this matches your frontend: POST /api/records
router.post("/", requireAuth, requireRole("faculty", "admin"), upsertRecord);

// keep list/delete
router.get("/", requireAuth, requireRole("faculty", "admin"), listRecords);
router.delete("/:id", requireAuth, requireRole("faculty", "admin"), deleteRecord);

// ✅ student
router.get("/my", requireAuth, requireRole("student"), myRecord);
router.get("/my-cluster", requireAuth, requireRole("student"), myCluster);

export default router;

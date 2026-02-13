import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { myProfile, upsertProfile } from "../controllers/students.controller.js";
import { mySuggestions } from "../controllers/students.controller.js";

const router = Router();

router.get("/me", requireAuth, requireRole("student"), myProfile);
router.post("/profile", requireAuth, requireRole("student"), upsertProfile);
router.get("/suggestions", requireAuth, requireRole("student"), mySuggestions);

export default router;

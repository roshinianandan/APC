import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listUsers,
  createUser,
  setUserActive
} from "../controllers/users.controller.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), listUsers);
router.post("/", requireAuth, requireRole("admin"), createUser);
router.patch("/:id/active", requireAuth, requireRole("admin"), setUserActive);

export default router;

import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { z } from "zod";
import { moderationController } from "../controllers/moderation.controller.js";

const router = Router();

const idParamSchema = z.object({
  id: z.string().uuid("Invalid publication ID"),
});

const rejectBodySchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

router.get("/moderation/pending", verifyToken, requireRole("verifier", "admin"), validateQuery(querySchema), moderationController.getPendingPublications);
router.get("/moderation/:id", verifyToken, requireRole("verifier", "admin"), validateParams(idParamSchema), moderationController.getPublicationById);
router.post("/moderation/:id/approve", verifyToken, requireRole("verifier", "admin"), validateParams(idParamSchema), moderationController.approvePublication);
router.post("/moderation/:id/reject", verifyToken, requireRole("verifier", "admin"), validateParams(idParamSchema), validateBody(rejectBodySchema), moderationController.rejectPublication);
router.get("/moderation/history/me", verifyToken, requireRole("verifier", "admin"), moderationController.getMyModerations);

export default router;
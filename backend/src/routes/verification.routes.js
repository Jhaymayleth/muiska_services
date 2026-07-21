import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { z } from "zod";
import { verificationController } from "../controllers/verification.controller.js";

const router = Router();

router.use(verifyToken);

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const rejectVerificationSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

const approveVerificationSchema = z.object({
  reason: z.string().optional(),
});

router.get("/my-status", verificationController.getMyVerificationStatus);

router.get(
  "/pending",
  requireRole("verifier", "admin"),
  verificationController.getPendingVerifications
);

router.get(
  "/:id",
  requireRole("verifier", "admin"),
  validateParams(idParamSchema),
  verificationController.getVerificationById
);

router.post(
  "/:id/approve",
  requireRole("verifier", "admin"),
  validateParams(idParamSchema),
  validateBody(approveVerificationSchema),
  verificationController.approveVerification
);

router.post(
  "/:id/reject",
  requireRole("verifier", "admin"),
  validateParams(idParamSchema),
  validateBody(rejectVerificationSchema),
  verificationController.rejectVerification
);

router.get(
  "/my-history",
  requireRole("verifier", "admin"),
  verificationController.getMyVerifications
);

export default router;
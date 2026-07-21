import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validateParams } from "../middlewares/validate.middleware.js";
import { z } from "zod";
import { notificationController } from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyToken);

const idParamSchema = z.object({
  id: z.string().uuid("Invalid notification ID"),
});

router.get("/", notificationController.getMyNotifications);
router.post("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", validateParams(idParamSchema), notificationController.markAsRead);
router.delete("/:id", validateParams(idParamSchema), notificationController.deleteNotification);

export default router;
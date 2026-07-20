import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { notificationController } from "../controllers/notification.controller.js";

const router = Router();

router.use(verifyToken);

router.get("/", notificationController.getMyNotifications);
router.post("/leer-todas", notificationController.markAllAsRead);
router.patch("/:id/leer", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
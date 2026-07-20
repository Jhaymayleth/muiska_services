import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";
import { moderationController } from "../controllers/moderation.controller.js";

const router = Router();

router.use(verifyToken);

router.get("/moderacion/pendientes", requireRole("verificador", "admin"), moderationController.getPendingPublications);
router.get("/moderacion/:id", requireRole("verificador", "admin"), moderationController.getPublicationById);
router.post("/moderacion/:id/aprobar", requireRole("verificador", "admin"), moderationController.approvePublication);
router.post("/moderacion/:id/rechazar", requireRole("verificador", "admin"), moderationController.rejectPublication);
router.get("/moderacion/historial/mio", requireRole("verificador", "admin"), moderationController.getMyModerations);

export default router;
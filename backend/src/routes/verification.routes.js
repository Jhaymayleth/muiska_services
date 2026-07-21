import { Router } from "express";
import { verifyToken, requireRole } from "../middlewares/auth.middleware.js";
import { verificationController } from "../controllers/verification.controller.js";

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Usuario: obtener su estado de verificación
router.get("/mi-estado", verificationController.getMyVerificationStatus);

// Verificador: lista perfiles pendientes
router.get("/pendientes", requireRole("verificador", "admin"), verificationController.getPendingVerifications);

// Verificador: ver detalle
router.get("/:id", requireRole("verificador", "admin"), verificationController.getVerificationById);

// Verificador: aprobar
router.post("/:id/aprobar", requireRole("verificador", "admin"), verificationController.approveVerification);

// Verificador: rechazar
router.post("/:id/rechazar", requireRole("verificador", "admin"), verificationController.rejectVerification);

// Verificador: historial
router.get("/historial/mio", requireRole("verificador", "admin"), verificationController.getMyVerifications);

export default router;
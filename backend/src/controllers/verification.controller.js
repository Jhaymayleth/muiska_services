import { verificationService } from "../services/verification.service.js";
import { notificationService } from "../services/notification.service.js";
import { pool } from "../config/database.js";

export const verificationController = {
  // Verificador: lista perfiles pendientes
  async getPendingVerifications(req, res, next) {
    try {
      const verificaciones = await verificationService.getPendingVerifications();
      res.json({ verificaciones });
    } catch (error) {
      next(error);
    }
  },

  // Verificador: ver detalle de una verificación
  async getVerificationById(req, res, next) {
    try {
      const { id } = req.params;
      const verificacion = await verificationService.getVerificationById(id);
      if (!verificacion) {
        return res.status(404).json({ message: "Verificación no encontrada" });
      }
      res.json({ verificacion });
    } catch (error) {
      next(error);
    }
  },

  // Verificador: aprobar verificación
  async approveVerification(req, res, next) {
    try {
      const { id } = req.params;
      const verificadorId = req.user.id;
      const verificacion = await verificationService.approveVerification(id, verificadorId);
      res.json({ message: "Perfil verificado correctamente", verificacion });
    } catch (error) {
      next(error);
    }
  },

  // Verificador: rechazar verificación
  async rejectVerification(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const verificadorId = req.user.id;

      if (!motivo || !motivo.trim()) {
        return res.status(400).json({ message: "El motivo es obligatorio" });
      }

      const verificacion = await verificationService.rejectVerification(id, verificadorId, motivo.trim());
      res.json({ message: "Perfil rechazado", verificacion });
    } catch (error) {
      next(error);
    }
  },

  // Usuario: obtener su estado de verificación
  async getMyVerificationStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await pool.query(
        `SELECT estado_verificacion, motivo_rechazo_verificacion, verificado_en, badge_verificado
         FROM users WHERE id = $1`,
        [userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json({ estado: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // Verificador: ver su historial
  async getMyVerifications(req, res, next) {
    try {
      const verificaciones = await verificationService.getVerificationsByVerifier(req.user.id);
      res.json({ verificaciones });
    } catch (error) {
      next(error);
    }
  }
};
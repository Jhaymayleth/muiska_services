import { verificationService } from "../services/verification.service.js";
import { notificationService } from "../services/notification.service.js";

export const verificationController = {
  // User: get their verification status
  async getMyVerificationStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const status = await verificationService.getMyVerificationStatus(userId);
      if (!status) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ status });
    } catch (error) {
      next(error);
    }
  },

  // Verifier: list pending profiles
  async getPendingVerifications(req, res, next) {
    try {
      const verifications = await verificationService.getPendingVerifications();
      res.json({ verifications });
    } catch (error) {
      next(error);
    }
  },

  // Verifier: view detail
  async getVerificationById(req, res, next) {
    try {
      const { id } = req.params;
      const verification = await verificationService.getVerificationById(id);
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      res.json({ verification });
    } catch (error) {
      next(error);
    }
  },

  // Verifier: approve
  async approveVerification(req, res, next) {
    try {
      const { id } = req.params;
      const verifierId = req.user.id;
      const verification = await verificationService.approveVerification(id, verifierId);
      res.json({ message: "Profile verified successfully", verification });
    } catch (error) {
      next(error);
    }
  },

  // Verifier: reject
  async rejectVerification(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const verifierId = req.user.id;

      const verification = await verificationService.rejectVerification(id, verifierId, reason.trim());
      res.json({ message: "Profile rejected", verification });
    } catch (error) {
      next(error);
    }
  },

  // Verifier: history
  async getMyVerifications(req, res, next) {
    try {
      const verifications = await verificationService.getVerificationsByVerifier(req.user.id);
      res.json({ verifications });
    } catch (error) {
      next(error);
    }
  }
};
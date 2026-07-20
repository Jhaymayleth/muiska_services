import { moderationService } from "../services/moderation.service.js";

export const moderationController = {
  async getPendingPublications(req, res, next) {
    try {
      const result = await moderationService.getPendingPublications(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getPublicationById(req, res, next) {
    try {
      const publication = await moderationService.getPublicationById(req.params.id);
      res.json(publication);
    } catch (error) {
      if (error.code === "NOT_FOUND") {
        return res.status(404).json({ message: error.message });
      }
      next(error);
    }
  },

  async approvePublication(req, res, next) {
    try {
      const result = await moderationService.approvePublication(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async rejectPublication(req, res, next) {
    try {
      const { motivo } = req.body;
      const result = await moderationService.rejectPublication(req.params.id, req.user.id, motivo);
      res.json(result);
    } catch (error) {
      if (error.code === "MISSING_REASON") {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  },

  async getMyModerations(req, res, next) {
    try {
      const result = await moderationService.getMyModerations(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
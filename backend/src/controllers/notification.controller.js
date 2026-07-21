import { notificationService } from "../services/notification.service.js";

export const notificationController = {
  async getMyNotifications(req, res, next) {
    try {
      const { limit = 20, offset = 0, unreadOnly } = req.query;
      const notifications = await notificationService.getUserNotifications(req.user.id, {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        unreadOnly: unreadOnly === "true"
      });
      const unreadCount = await notificationService.getUnreadCount(req.user.id);
      res.json({ notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id, req.user.id);
      if (!notification) {
        return res.status(404).json({ message: "Notificación no encontrada" });
      }
      res.json({ notification });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.json({ message: "Todas las notificaciones marcadas como leídas" });
    } catch (error) {
      next(error);
    }
  },

  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await notificationService.deleteNotification(id, req.user.id);
      if (!notification) {
        return res.status(404).json({ message: "Notificación no encontrada" });
      }
      res.json({ message: "Notificación eliminada" });
    } catch (error) {
      next(error);
    }
  }
};
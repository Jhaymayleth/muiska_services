import { pool } from "../config/database.js";
import { pushService } from "./push.service.js";

export const notificationService = {
  async createNotification({ userId, type, title, message, data = {} }) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, JSON.stringify(data)]
    );

    pushService.sendToUser(userId, { title, message, url: data?.url || "/" }).catch(() => {});

    return result.rows[0];
  },

  async getUserNotifications(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
    let query = `SELECT * FROM notifications WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async markAsRead(notificationId, userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  },

  async markAllAsRead(userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING *`,
      [userId]
    );
    return result.rows;
  },

  async deleteNotification(notificationId, userId) {
    const result = await pool.query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  }
};
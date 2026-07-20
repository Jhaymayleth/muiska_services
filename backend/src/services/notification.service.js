import { pool } from "../config/database.js";

export const notificationService = {
  async createNotification({ usuarioId, tipo, titulo, mensaje, datos = {} }) {
    const result = await pool.query(
      `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [usuarioId, tipo, titulo, mensaje, JSON.stringify(datos)]
    );
    return result.rows[0];
  },

  async getUserNotifications(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
    let query = `SELECT * FROM notificaciones WHERE usuario_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      query += ` AND leida = FALSE`;
    }

    query += ` ORDER BY creado_en DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getUnreadCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notificaciones WHERE usuario_id = $1 AND leida = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  },

  async markAsRead(notificationId, userId) {
    const result = await pool.query(
      `UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND usuario_id = $2 RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  },

  async markAllAsRead(userId) {
    const result = await pool.query(
      `UPDATE notificaciones SET leida = TRUE WHERE usuario_id = $1 AND leida = FALSE RETURNING *`,
      [userId]
    );
    return result.rows;
  },

  async deleteNotification(notificationId, userId) {
    const result = await pool.query(
      `DELETE FROM notificaciones WHERE id = $1 AND usuario_id = $2 RETURNING *`,
      [notificationId, userId]
    );
    return result.rows[0];
  }
};
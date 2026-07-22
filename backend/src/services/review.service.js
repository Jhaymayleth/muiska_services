import { pool } from "../config/database.js";

export const reviewService = {
  async create(publicationId, reviewerId, { rating, comment }) {
    const pubResult = await pool.query(
      `SELECT p.user_id, p.id FROM publications p WHERE p.id = $1 AND p.status = 'active' AND p.moderation_status = 'approved'`,
      [publicationId]
    );
    if (pubResult.rows.length === 0) {
      const error = new Error("Publication not found or not available");
      error.code = "NOT_FOUND";
      throw error;
    }

    if (pubResult.rows[0].user_id === reviewerId) {
      const error = new Error("Cannot review your own publication");
      error.code = "FORBIDDEN";
      throw error;
    }

    const result = await pool.query(
      `INSERT INTO reviews (publication_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (publication_id, reviewer_id)
       DO UPDATE SET rating = $3, comment = $4, created_at = NOW()
       RETURNING *`,
      [publicationId, reviewerId, rating, comment || null]
    );

    await this.updateUserRating(pubResult.rows[0].user_id);

    return result.rows[0];
  },

  async getByPublication(publicationId) {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.id as reviewer_id, u.name as reviewer_name, u.profile_image_url as reviewer_avatar
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.publication_id = $1
       ORDER BY r.created_at DESC`,
      [publicationId]
    );
    return result.rows;
  },

  async getByUser(userId) {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              p.id as publication_id, p.title as publication_title,
              u.id as reviewer_id, u.name as reviewer_name, u.profile_image_url as reviewer_avatar
       FROM reviews r
       JOIN publications p ON r.publication_id = p.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE p.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getAverage(userId) {
    const result = await pool.query(
      `SELECT COALESCE(AVG(r.rating), 0)::numeric(3,2) as avg_rating,
              COUNT(r.id) as total_reviews
       FROM reviews r
       JOIN publications p ON r.publication_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    );
    return result.rows[0];
  },

  async updateUserRating(userId) {
    const stats = await this.getAverage(userId);
    await pool.query(
      `UPDATE users SET avg_rating = $1, total_reviews = $2 WHERE id = $3`,
      [stats.avg_rating, parseInt(stats.total_reviews, 10), userId]
    );
  },
};

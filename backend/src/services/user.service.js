import { pool } from "../config/database.js";

export const userService = {
  async getPublicProfile(id) {
    const profileResult = await pool.query(
      `SELECT u.id, u.name, u.bio, u.profile_image_url, u.whatsapp,
              u.is_verified_badge, u.verification_status,
              u.lat, u.lng, u.avg_rating, u.total_reviews,
              n.name as neighborhood_name, n.locality
       FROM users u
       LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id
       WHERE u.id = $1`,
      [id]
    );
    return profileResult.rows[0] || null;
  },

  async getUserStats(id) {
    const statsResult = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') AS active_listings,
         COALESCE(AVG(r.rating), 0) AS avg_rating,
         COUNT(r.id) AS total_reviews
       FROM publications p
       LEFT JOIN reviews r ON r.publication_id = p.id
       WHERE p.user_id = $1 AND p.moderation_status = 'approved'`,
      [id]
    );
    return statsResult.rows[0];
  },

  async getUserActivePublications(id) {
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.price, p.images,
              p.location, p.contact_method, p.created_at,
              c.name as category
       FROM publications p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.user_id = $1 AND p.status = 'active' AND p.moderation_status = 'approved'
       ORDER BY p.created_at DESC`,
      [id]
    );
    return result.rows;
  },
};

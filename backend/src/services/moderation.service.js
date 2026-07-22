import { pool } from "../config/database.js";

const publicationSelectFields = `
  p.id, p.title, p.description, p.price, p.type, p.category_id,
  c.name as category, p.images, p.location, p.contact_method,
  p.user_id, p.status, p.moderation_status, p.rejection_reason,
  p.created_at, p.updated_at
`;

export const moderationService = {
  async getPendingPublications({ page = 1, limit = 12, search, category }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = "WHERE p.moderation_status = 'pending'";
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM publications p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limitNum, offset);
    const result = await pool.query(
      `SELECT ${publicationSelectFields}
       FROM publications p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params,
    );

    return {
      data: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT ${publicationSelectFields}
       FROM publications p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async approvePublication(id, moderatorId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const pubResult = await client.query(
        `UPDATE publications
         SET moderation_status = 'approved', moderated_by = $1, moderated_at = NOW(), 
             rejection_reason = NULL, status = 'active'
         WHERE id = $2 AND moderation_status = 'pending'
         RETURNING *`,
        [moderatorId, id],
      );

      if (pubResult.rows.length === 0) {
        throw new Error("Publication not found or already processed");
      }

      const publication = pubResult.rows[0];

      await client.query(
        `INSERT INTO moderations (publication_id, moderator_id, action, reason)
         VALUES ($1, $2, 'approved', $3)`,
        [id, moderatorId, "Publication approved"],
      );

      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, 'publication_approved', $2, $3, $4)`,
        [
          publication.user_id,
          "Publication Approved!",
          "Your publication has been approved and is now visible on the platform.",
          JSON.stringify({ publication_id: id }),
        ],
      );

      await client.query("COMMIT");
      return { success: true, publication };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async rejectPublication(id, moderatorId, reason) {
    if (!reason || reason.trim() === "") {
      const error = new Error("Rejection reason is required");
      error.code = "MISSING_REASON";
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const pubResult = await client.query(
        `UPDATE publications
         SET moderation_status = 'rejected', moderated_by = $1, moderated_at = NOW(),
             rejection_reason = $2, status = 'inactive'
         WHERE id = $3 AND moderation_status = 'pending'
         RETURNING *`,
        [moderatorId, reason, id],
      );

      if (pubResult.rows.length === 0) {
        throw new Error("Publication not found or already processed");
      }

      const publication = pubResult.rows[0];

      await client.query(
        `INSERT INTO moderations (publication_id, moderator_id, action, reason)
         VALUES ($1, $2, 'rejected', $3)`,
        [id, moderatorId, reason],
      );

      await client.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES ($1, 'publication_rejected', $2, $3, $4)`,
        [
          publication.user_id,
          "Publication Rejected",
          `Your publication was rejected: ${reason}. You can correct the information and try again.`,
          JSON.stringify({ publication_id: id, reason }),
        ],
      );

      await client.query("COMMIT");
      return { success: true, publication };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async getMyModerations(moderatorId) {
    const result = await pool.query(
      `SELECT m.*, p.title, p.price, p.status
       FROM moderations m
       JOIN publications p ON m.publication_id = p.id
       WHERE m.moderator_id = $1
       ORDER BY m.created_at DESC`,
      [moderatorId],
    );
    return result.rows;
  },
};
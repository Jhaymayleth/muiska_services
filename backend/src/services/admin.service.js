import { pool } from "../config/database.js";

export const adminService = {
  async getUsers(search = "") {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.user_type, u.is_banned, u.created_at,
             COUNT(p.id) as publication_count
      FROM users u
      LEFT JOIN publications p ON p.user_id = u.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE u.name ILIKE $1 OR u.email ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async updateUser(id, { name, email, role, is_banned }) {
    const result = await pool.query(
      `UPDATE users SET 
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         is_banned = COALESCE($4, is_banned),
         updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, role, user_type, is_banned, created_at`,
      [name, email, role, is_banned, id]
    );

    if (result.rows.length === 0) {
      const error = new Error("User not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async deleteUser(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      const error = new Error("User not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "User deleted" };
  },

  async getPublications({ page = 1, limit = 20, status, search, category }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = "WHERE 1=1";
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

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
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limitNum, offset);
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email, c.name as category
       FROM publications p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
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

async assignVerifier(userId) {
    const result = await pool.query(
      `UPDATE users SET role = 'verifier', user_type = 'verifier', updated_at = NOW()
       WHERE id = $1 AND role != 'admin'
       RETURNING id, name, email, role, user_type`,
      [userId]
    );
    if (result.rows.length === 0) {
      const error = new Error("User not found or cannot be assigned");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async removeVerifier(userId) {
    const result = await pool.query(
      `UPDATE users SET role = 'user', user_type = 'client', updated_at = NOW()
       WHERE id = $1 AND role = 'verifier'
       RETURNING id, name, email, role, user_type`,
      [userId]
    );
    if (result.rows.length === 0) {
      const error = new Error("User not found or not a verifier");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async getVerifiers() {
    const result = await pool.query(
      `SELECT id, name, email, role, user_type, created_at
       FROM users WHERE role = 'verifier'
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async updatePublication(id, { status, title, description, price, category, location, contact_method }) {
    let categoryId = undefined;
    if (category) {
      const catResult = await pool.query("SELECT id FROM categories WHERE name = $1", [category]);
      if (catResult.rows.length > 0) {
        categoryId = catResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `UPDATE publications
       SET status = COALESCE($1, status),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           category_id = COALESCE($5, category_id),
           location = COALESCE($6, location),
           contact_method = COALESCE($7, contact_method),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [status, title, description, price, categoryId, location, contact_method, id]
    );

    if (result.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async deletePublication(id) {
    const result = await pool.query(
      "DELETE FROM publications WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "Publication deleted" };
  },

  async getCategoriesWithCount() {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.slug, c.created_at,
              COUNT(p.id) as publication_count
       FROM categories c
       LEFT JOIN publications p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name`
    );
    return result.rows;
  },

  async getDashboardStats() {
    const [users, pubs, cats] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'active') as active FROM publications"),
      pool.query("SELECT COUNT(*) FROM categories"),
    ]);

    return {
      totals: {
        users: parseInt(users.rows[0].count, 10),
        publications: parseInt(pubs.rows[0].count, 10),
        activePublications: parseInt(pubs.rows[0].active, 10),
        categories: parseInt(cats.rows[0].count, 10),
      },
    };
  },
};
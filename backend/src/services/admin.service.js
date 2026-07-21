import { pool } from "../config/database.js";

// Servicio de administración: lógica para panel de admin
export const adminService = {
  // Obtener todos los usuarios (con búsqueda opcional)
  async getUsers(search = "") {
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.tipo_usuario, u.is_banned, u.created_at,
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

  // Actualizar usuario (admin puede cambiar rol, ban/desban)
  async updateUser(id, { name, email, role, is_banned }) {
    const result = await pool.query(
      `UPDATE users SET 
         name = COALESCE($1, name),
         email = COALESCE($2, email),
         role = COALESCE($3, role),
         is_banned = COALESCE($4, is_banned),
         updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, role, tipo_usuario, is_banned, created_at`,
      [name, email, role, is_banned, id]
    );

    if (result.rows.length === 0) {
      const error = new Error("Usuario no encontrado");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Eliminar usuario (admin)
  async deleteUser(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      const error = new Error("Usuario no encontrado");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "Usuario eliminado" };
  },

  // Obtener todas las publicaciones (admin ve todas, sin importar estado)
  async getPublications({ page = 1, limit = 20, status, search }) {
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

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM publications p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limitNum, offset);
    const result = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM publications p
       JOIN users u ON p.user_id = u.id
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

  // Asignar rol de verificador (solo admin)
  async assignVerifier(userId) {
    const result = await pool.query(
      `UPDATE users SET role = 'verificador', tipo_usuario = 'verificador', updated_at = NOW()
       WHERE id = $1 AND role != 'admin'
       RETURNING id, name, email, role, tipo_usuario`,
      [userId]
    );
    if (result.rows.length === 0) {
      const error = new Error("Usuario no encontrado o no se puede asignar");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Quitar rol de verificador (solo admin)
  async removeVerifier(userId) {
    const result = await pool.query(
      `UPDATE users SET role = 'user', tipo_usuario = 'cliente', updated_at = NOW()
       WHERE id = $1 AND role = 'verificador'
       RETURNING id, name, email, role, tipo_usuario`,
      [userId]
    );
    if (result.rows.length === 0) {
      const error = new Error("Usuario no encontrado o no es verificador");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Listar verificadores
  async getVerifiers() {
    const result = await pool.query(
      `SELECT id, name, email, role, tipo_usuario, created_at
       FROM users WHERE role = 'verificador'
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  // Actualizar publicación (admin)
  async updatePublication(id, { status, title, description, price, category, location, contact_method }) {
    const result = await pool.query(
      `UPDATE publications
       SET status = COALESCE($1, status),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           category = COALESCE($5, category),
           location = COALESCE($6, location),
           contact_method = COALESCE($7, contact_method),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [status, title, description, price, category, location, contact_method, id]
    );

    if (result.rows.length === 0) {
      const error = new Error("Publicación no encontrada");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Eliminar publicación (admin)
  async deletePublication(id) {
    const result = await pool.query(
      "DELETE FROM publications WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      const error = new Error("Publicación no encontrada");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "Publicación eliminada" };
  },
};
import { pool } from "../config/database.js";

const publicationSelectFields = `
  p.id, p.title, p.description, p.price, p.tipo, p.category_id,
  c.name as category, p.images, p.location, p.contact_method,
  p.user_id, p.status, p.estado_moderacion, p.motivo_rechazo_moderacion,
  p.created_at, p.updated_at
`;

export const moderationService = {
  async getPendingPublications({ page = 1, limit = 12, search, category }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = "WHERE p.estado_moderacion = 'pendiente'";
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
      const error = new Error("Publicación no encontrada");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async approvePublication(id, verificadorId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const pubResult = await client.query(
        `UPDATE publications
         SET estado_moderacion = 'aprobada', moderado_por = $1, moderado_en = NOW(), 
             motivo_rechazo_moderacion = NULL, status = 'active'
         WHERE id = $2 AND estado_moderacion = 'pendiente'
         RETURNING *`,
        [verificadorId, id],
      );

      if (pubResult.rows.length === 0) {
        throw new Error("Publicación no encontrada o ya procesada");
      }

      const publication = pubResult.rows[0];

      await client.query(
        `INSERT INTO moderaciones (publicacion_id, verificador_id, accion, motivo)
         VALUES ($1, $2, 'aprobada', $3)`,
        [id, verificadorId, "Publicación aprobada"],
      );

      await client.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos)
         VALUES ($1, 'publicacion_aprobada', $2, $3, $4)`,
        [
          publication.user_id,
          "¡Publicación aprobada!",
          "Tu publicación ha sido aprobada y ya está visible en la plataforma.",
          JSON.stringify({ publicacion_id: id }),
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

  async rejectPublication(id, verificadorId, motivo) {
    if (!motivo || motivo.trim() === "") {
      const error = new Error("El motivo de rechazo es obligatorio");
      error.code = "MISSING_REASON";
      throw error;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const pubResult = await client.query(
        `UPDATE publications
         SET estado_moderacion = 'rechazada', moderado_por = $1, moderado_en = NOW(), 
             motivo_rechazo_moderacion = $2, status = 'inactive'
         WHERE id = $3 AND estado_moderacion = 'pendiente'
         RETURNING *`,
        [verificadorId, motivo, id],
      );

      if (pubResult.rows.length === 0) {
        throw new Error("Publicación no encontrada o ya procesada");
      }

      const publication = pubResult.rows[0];

      await client.query(
        `INSERT INTO moderaciones (publicacion_id, verificador_id, accion, motivo)
         VALUES ($1, $2, 'rechazada', $3)`,
        [id, verificadorId, motivo],
      );

      await client.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, datos)
         VALUES ($1, 'publicacion_rechazada', $2, $3, $4)`,
        [
          publication.user_id,
          "Publicación rechazada",
          `Tu publicación no fue aprobada: ${motivo}. Puedes corregirla e intentarlo de nuevo.`,
          JSON.stringify({ publicacion_id: id, motivo }),
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

  async getModerationHistory(verificadorId) {
    const result = await pool.query(
      `SELECT m.*, p.title as publicacion_titulo, u.name as usuario_nombre
       FROM moderaciones m
       JOIN publications p ON m.publicacion_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE m.verificador_id = $1
       ORDER BY m.creado_en DESC`,
      [verificadorId],
    );
    return result.rows;
  },
};
import { pool } from "../config/database.js";

// Servicio de favoritos: lógica de negocio + SQL
export const favoriteService = {
  // Alternar favorito (toggle): si existe lo elimina, si no lo crea
  async toggleFavorite(userId, publicationId) {
    // Verificar que la publicación existe
    const pubCheck = await pool.query(
      "SELECT id FROM publications WHERE id = $1",
      [publicationId]
    );
    if (pubCheck.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }

    // Verificar si ya es favorito
    const existing = await pool.query(
      "SELECT 1 FROM favorites WHERE user_id = $1 AND publication_id = $2",
      [userId, publicationId]
    );

    if (existing.rows.length > 0) {
      // Ya es favorito -> eliminar
      await pool.query(
        "DELETE FROM favorites WHERE user_id = $1 AND publication_id = $2",
        [userId, publicationId]
      );
      return { favorited: false };
    } else {
      // No es favorito -> agregar
      await pool.query(
        "INSERT INTO favorites (user_id, publication_id) VALUES ($1, $2)",
        [userId, publicationId]
      );
      return { favorited: true };
    }
  },

  // Obtener favoritos del usuario con paginación
  async getFavorites(userId, { page = 1, limit = 12 }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Contar total
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM favorites WHERE user_id = $1",
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Obtener favoritos con JOIN a publications + categories
    const result = await pool.query(
      `SELECT p.id, p.title, p.description, p.price, p.category_id, 
              c.name as category, p.images, p.location, p.contact_method,
              p.user_id, p.status, p.created_at, p.updated_at,
              u.name as user_name, u.email as user_email
       FROM favorites f
       JOIN publications p ON p.id = f.publication_id
       LEFT JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.user_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limitNum, offset]
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

  // Verificar si una publicación es favorita del usuario
  async checkFavorite(userId, publicationId) {
    const result = await pool.query(
      "SELECT 1 FROM favorites WHERE user_id = $1 AND publication_id = $2",
      [userId, publicationId]
    );
    return { favorited: result.rows.length > 0 };
  },
};
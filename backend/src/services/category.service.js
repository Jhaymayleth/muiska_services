import { pool } from "../config/database.js";

// Servicio de categorías: lógica de negocio + SQL
export const categoryService = {
  // Obtener todas las categorías
  async getAll() {
    const result = await pool.query(
      "SELECT id, name, slug, description, created_at FROM categories ORDER BY name ASC"
    );
    return result.rows;
  },

  // Obtener categoría por ID
  async getById(id) {
    const result = await pool.query(
      "SELECT id, name, slug, description, created_at FROM categories WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      const error = new Error("Categoría no encontrada");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Crear categoría
  async create({ name, description }) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    const result = await pool.query(
      "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created_at",
      [name, slug, description || null]
    );
    return result.rows[0];
  },

  // Actualizar categoría
  async update(id, { name, description }) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    const result = await pool.query(
      "UPDATE categories SET name = $1, slug = $2, description = COALESCE($3, description) WHERE id = $4 RETURNING id, name, slug, description, created_at",
      [name, slug, description, id]
    );

    if (result.rows.length === 0) {
      const error = new Error("Categoría no encontrada");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Eliminar categoría
  async remove(id) {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      const error = new Error("Categoría no encontrada");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "Categoría eliminada" };
  },
};
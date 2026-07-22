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
      const error = new Error("Category not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Crear categoría
  async create({ name, description }) {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    // Handle slug collision
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await pool.query("SELECT id FROM categories WHERE slug = $1", [finalSlug]);
      if (existing.rows.length === 0) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    slug = finalSlug;

    const result = await pool.query(
      "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created_at",
      [name, slug, description || null]
    );
    return result.rows[0];
  },

  // Actualizar categoría
  async update(id, { name, description }) {
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    // Handle slug collision (excluding current category)
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await pool.query("SELECT id FROM categories WHERE slug = $1 AND id != $2", [finalSlug, id]);
      if (existing.rows.length === 0) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    slug = finalSlug;

    const result = await pool.query(
      "UPDATE categories SET name = $1, slug = $2, description = COALESCE($3, description) WHERE id = $4 RETURNING id, name, slug, description, created_at",
      [name, slug, description, id]
    );

    if (result.rows.length === 0) {
      const error = new Error("Category not found");
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
      const error = new Error("Category not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "Category deleted" };
  },
};
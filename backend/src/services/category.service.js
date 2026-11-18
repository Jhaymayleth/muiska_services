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
  async create({ name, slug: providedSlug, description }) {
    // El slug es opcional en el contrato: si no viene, se deriva del nombre.
    const baseSlug = (providedSlug || name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Handle slug collision
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await pool.query("SELECT id FROM categories WHERE slug = $1", [slug]);
      if (existing.rows.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await pool.query(
      "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created_at",
      [name, slug, description || null]
    );
    return result.rows[0];
  },

  // Actualizar categoría
  async update(id, { name, slug: providedSlug, description }) {
    // Actualización parcial: antes un cambio solo de descripción lanzaba un
    // TypeError porque el slug se generaba a partir de `name`.
    let slug = providedSlug;
    if (slug === undefined && name) {
      const baseSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Handle slug collision (excluding current category)
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const existing = await pool.query("SELECT id FROM categories WHERE slug = $1 AND id != $2", [slug, id]);
        if (existing.rows.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const result = await pool.query(
      `UPDATE categories SET
         name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description)
       WHERE id = $4
       RETURNING id, name, slug, description, created_at`,
      [name || null, slug || null, description, id]
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
import { pool } from "../config/database.js";

export const getAll = async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, slug, description, created_at FROM categories ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, name, slug, description, created_at FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    const result = await pool.query(
      "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description, created_at",
      [name, slug, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "La categoría ya existe" });
    }
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü]+/g, "-")
      .replace(/^-|-$/g, "");

    const result = await pool.query(
      "UPDATE categories SET name = $1, slug = $2, description = COALESCE($3, description) WHERE id = $4 RETURNING id, name, slug, description, created_at",
      [name, slug, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "La categoría ya existe" });
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    next(error);
  }
};

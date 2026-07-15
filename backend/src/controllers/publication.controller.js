import { pool } from "../config/database.js";
import { normalizePublicationPayload } from "../utils/publication.utils.js";

export const getAll = async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM publications ORDER BY created_at DESC",
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
      "SELECT * FROM publications WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const normalized = normalizePublicationPayload(req.body);

    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const result = await pool.query(
      `INSERT INTO publications (title, description, price, category, images, location, contact_method, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        normalized.title,
        normalized.description,
        normalized.price,
        normalized.category,
        images,
        normalized.location,
        normalized.contact_method,
        req.user?.id || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const normalized = normalizePublicationPayload(req.body);

    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const result = await pool.query(
      `UPDATE publications
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           images = COALESCE($5, images),
           location = COALESCE($6, location),
           contact_method = COALESCE($7, contact_method),
           status = COALESCE($8, status),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        normalized.title || null,
        normalized.description || null,
        normalized.price || null,
        normalized.category,
        images,
        normalized.location,
        normalized.contact_method,
        req.body.status || null,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM publications WHERE id = $1 RETURNING id",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
    res.json({ message: "Publicación eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

import { pool } from "../config/database.js";
import { normalizePublicationPayload } from "../utils/publication.utils.js";

export const getAll = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      location,
      search,
      status = "active",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = "WHERE status = $1";
    const params = [status];
    let paramIndex = 2;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minPrice) {
      whereClause += ` AND price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereClause += ` AND price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (location) {
      whereClause += ` AND location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM publications ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limitNum, offset);
    const result = await pool.query(
      `SELECT * FROM publications ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params,
    );

    res.json({
      data: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
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

export const getMine = async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM publications
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id],
    );

    res.json(result.rows);
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
        req.user.id,
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
       AND user_id = $10
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
        req.user.id,
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
      "DELETE FROM publications WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
    res.json({ message: "Publicación eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

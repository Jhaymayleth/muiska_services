import { pool } from "../config/database.js";
import { normalizePublicationPayload } from "../utils/publication.utils.js";

const MAX_PUBLICATION_PRICE = 99_999_999.99;

const isValidPublicationPrice = (price) =>
  Number.isFinite(price) && price > 0 && price <= MAX_PUBLICATION_PRICE;

const publicationSelectFields = `
  p.id, p.title, p.description, p.price, p.category_id, 
  c.name as category, p.images, p.location, p.contact_method, 
  p.user_id, p.status, p.created_at, p.updated_at
`;

export const getAll = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      location,
      search,
      status,
      page = 1,
      limit = 12,
      user_id,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = "WHERE 1=1";
    let paramIndex = 1;

    const normalizedStatus = status || (user_id ? null : "active");
    if (normalizedStatus) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(normalizedStatus);
      paramIndex++;
    }

    if (user_id) {
      whereClause += ` AND p.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (minPrice) {
      whereClause += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereClause += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (location) {
      whereClause += ` AND p.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
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
       ORDER BY p.created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
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
      `SELECT ${publicationSelectFields} 
       FROM publications p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
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
      `SELECT ${publicationSelectFields}
       FROM publications p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
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

    if (!isValidPublicationPrice(normalized.price)) {
      return res.status(400).json({
        message: "El precio debe ser mayor que 0 y no superar 99.999.999,99",
      });
    }

    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Buscar category_id por nombre de categoría
    let categoryId = null;
    if (normalized.category) {
      const catResult = await pool.query(
        "SELECT id FROM categories WHERE name = $1",
        [normalized.category]
      );
      if (catResult.rows.length > 0) {
        categoryId = catResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO publications (title, description, price, category_id, images, location, contact_method, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        normalized.title,
        normalized.description,
        normalized.price,
        categoryId,
        images,
        normalized.location,
        normalized.contact_method,
        req.user.id,
      ],
    );
    
    // Retornar con nombre de categoría incluido
    const pubResult = await pool.query(
      `SELECT ${publicationSelectFields} 
       FROM publications p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [result.rows[0].id]
    );
    
    res.status(201).json(pubResult.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const normalized = normalizePublicationPayload(req.body);

    if (req.body.price !== undefined && !isValidPublicationPrice(normalized.price)) {
      return res.status(400).json({
        message: "El precio debe ser mayor que 0 y no superar 99.999.999,99",
      });
    }

    let images = normalized.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    // Buscar category_id si se envía categoría
    let categoryId = undefined;
    if (normalized.category) {
      const catResult = await pool.query(
        "SELECT id FROM categories WHERE name = $1",
        [normalized.category]
      );
      if (catResult.rows.length > 0) {
        categoryId = catResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `UPDATE publications
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category_id = COALESCE($4, category_id),
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
        categoryId,
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
    
    // Retornar con nombre de categoría incluido
    const pubResult = await pool.query(
      `SELECT ${publicationSelectFields} 
       FROM publications p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [id]
    );
    
    res.json(pubResult.rows[0]);
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

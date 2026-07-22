import { pool } from "../config/database.js";

const publicationSelectFields = `
  p.id, p.title, p.description, p.price, p.category_id, 
  c.name as category, p.images, p.location, p.contact_method, 
  p.user_id, p.status, p.type, p.moderation_status, p.moderated_by, p.moderated_at,
  p.rejection_reason, p.business_hours, p.coverage_area, p.price_type,
  p.created_at, p.updated_at,
  u.name as user_name
`;

const MAX_PUBLICATION_PRICE = 99_999_999.99;

const isValidPublicationPrice = (price) =>
  Number.isFinite(price) && price > 0 && price <= MAX_PUBLICATION_PRICE;

export const publicationService = {
  async getAll({ category, minPrice, maxPrice, location, search, status, page = 1, limit = 12, user_id, lat, lng, radius }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let whereClause = "WHERE 1=1";
    let paramIndex = 1;
    const hasGeo = lat && lng && radius;
    let distanceSelect = "";

    const normalizedStatus = status || (user_id ? null : "active");
    if (normalizedStatus) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(normalizedStatus);
      paramIndex++;
    }

    // Public queries: only show approved publications
    if (!user_id) {
      whereClause += ` AND p.moderation_status = $${paramIndex}`;
      params.push("approved");
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

    const joinClause = `FROM publications p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.user_id = u.id`;

    if (hasGeo) {
      distanceSelect = `, ROUND(ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(u.lng, u.lat), 4326)::geography
      )) AS distance_meters`;
      whereClause += ` AND u.lat IS NOT NULL AND u.lng IS NOT NULL
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          ST_SetSRID(ST_MakePoint(u.lng, u.lat), 4326)::geography,
          $${paramIndex + 2}
        )`;
      params.push(parseFloat(lng), parseFloat(lat), parseFloat(radius) * 1000);
      paramIndex += 3;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) ${joinClause} ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limitNum, offset);
    const orderBy = hasGeo ? "distance_meters ASC" : "p.created_at DESC";
    const result = await pool.query(
      `SELECT ${publicationSelectFields}${distanceSelect}
       ${joinClause}
       ${whereClause}
       ORDER BY ${orderBy}
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
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id],
    );
    if (result.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async getMine(userId) {
    const result = await pool.query(
      `SELECT ${publicationSelectFields}
       FROM publications p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  async create(userId, { title, description, price, category, images, location, contact_method, type, business_hours, coverage_area, price_type }) {
    if (!isValidPublicationPrice(price)) {
      const error = new Error("Price must be greater than 0 and not exceed 99,999,999.99");
      error.code = "INVALID_PRICE";
      throw error;
    }

    let categoryId = null;
    if (category) {
      const catResult = await pool.query("SELECT id FROM categories WHERE name = $1", [category]);
      if (catResult.rows.length > 0) {
        categoryId = catResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO publications (title, description, price, category_id, images, location, contact_method, user_id, type, business_hours, coverage_area, price_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [title, description, price, categoryId, images, location, contact_method, userId, type, business_hours, coverage_area, price_type],
    );

    return this.getById(result.rows[0].id);
  },

  async update(id, userId, { title, description, price, category, images, location, contact_method, status, type, business_hours, coverage_area, price_type }) {
    if (price !== undefined && !isValidPublicationPrice(price)) {
      const error = new Error("Price must be greater than 0 and not exceed 99,999,999.99");
      error.code = "INVALID_PRICE";
      throw error;
    }

    let categoryId = undefined;
    if (category) {
      const catResult = await pool.query("SELECT id FROM categories WHERE name = $1", [category]);
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
           type = COALESCE($9, type),
           business_hours = COALESCE($10, business_hours),
           coverage_area = COALESCE($11, coverage_area),
           price_type = COALESCE($12, price_type),
           updated_at = NOW()
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [title || null, description || null, price || null, categoryId, images, location, contact_method, status || null, type || null, business_hours || null, coverage_area || null, price_type || null, id, userId],
    );

    if (result.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }

    return this.getById(id);
  },

  async remove(id, userId) {
    const result = await pool.query(
      "DELETE FROM publications WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId],
    );
    if (result.rows.length === 0) {
      const error = new Error("Publication not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return { message: "Publication deleted successfully" };
  },
};
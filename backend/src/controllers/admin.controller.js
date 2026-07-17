import { pool } from "../config/database.js";

const allowedRoles = new Set(["user", "admin"]);

const getManagedUser = async (id) => {
  const result = await pool.query("SELECT id, role FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const preventSelfManagement = (targetUser, currentUser, res) => {
  if (targetUser.id === currentUser.id) {
    res.status(400).json({ message: "No puedes modificar o eliminar tu propia cuenta desde este panel" });
    return true;
  }
  return false;
};

export const getUsers = async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const params = [];
    const where = search ? "WHERE u.name ILIKE $1 OR u.email ILIKE $1" : "";
    if (search) params.push(`%${search}%`);

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.is_banned, u.created_at,
              COUNT(p.id)::int AS publication_count
       FROM users u
       LEFT JOIN publications p ON p.user_id = u.id
       ${where}
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      params,
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const targetUser = await getManagedUser(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado" });
    if (preventSelfManagement(targetUser, req.user, res)) return;

    const updates = [];
    const values = [];
    if (req.body.role !== undefined) {
      if (!allowedRoles.has(req.body.role)) {
        return res.status(400).json({ message: "Rol no válido" });
      }
      values.push(req.body.role);
      updates.push(`role = $${values.length}`);
    }
    if (req.body.is_banned !== undefined) {
      if (typeof req.body.is_banned !== "boolean") {
        return res.status(400).json({ message: "El estado de suspensión no es válido" });
      }
      values.push(req.body.is_banned);
      updates.push(`is_banned = $${values.length}`);
    }
    if (updates.length === 0) {
      return res.status(400).json({ message: "No hay cambios para aplicar" });
    }

    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, email, role, is_banned, created_at`,
      values,
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const targetUser = await getManagedUser(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado" });
    if (preventSelfManagement(targetUser, req.user, res)) return;

    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

// Admin - Publications
export const getPublications = async (req, res, next) => {
  try {
    const {
      status,
      search,
      category,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = "WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
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
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM publications p
       LEFT JOIN users u ON u.id = p.user_id
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
    console.error("Error in getPublications:", error);
    next(error);
  }
};

export const updatePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status && !["active", "sold", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    const result = await pool.query(
      `UPDATE publications
       SET status = COALESCE($1, status), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status || null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deletePublication = async (req, res, next) => {
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
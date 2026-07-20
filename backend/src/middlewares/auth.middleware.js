import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "muiska_jwt_secret_dev_2024");
    const result = await pool.query(
      `SELECT id, name, email, role, tipo_usuario, estado_verificacion, badge_verificado, is_banned 
       FROM users WHERE id = $1`,
      [decoded.id],
    );

    const user = result.rows[0];
    if (!user || user.is_banned) {
      return res.status(403).json({ message: "Tu cuenta no tiene acceso" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
    next(error);
  }
};

export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Permisos insuficientes" });
    }
    next();
  };
};

export const requireAdmin = requireRole("admin");

export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "muiska_jwt_secret_dev_2024");
    const result = await pool.query(
      `SELECT id, name, email, role, tipo_usuario, estado_verificacion, badge_verificado, is_banned 
       FROM users WHERE id = $1`,
      [decoded.id],
    );
    req.user = result.rows[0] || null;
    if (req.user?.is_banned) req.user = null;
  } catch {
    req.user = null;
  }
  next();
};

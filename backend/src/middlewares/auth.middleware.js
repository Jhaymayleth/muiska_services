import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import { config } from "../config/index.js";

export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token required" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const result = await pool.query(
      `SELECT id, name, email, role, user_type, verification_status, is_verified_badge, is_banned, rejection_reason
       FROM users WHERE id = $1`,
      [decoded.id],
    );

    const user = result.rows[0];
    if (!user || user.is_banned) {
      return res.status(403).json({ message: "Account does not have access" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    next(error);
  }
};

export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
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
    const decoded = jwt.verify(token, config.jwt.secret);
    const result = await pool.query(
      `SELECT id, name, email, role, user_type, verification_status, is_verified_badge, is_banned, rejection_reason
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
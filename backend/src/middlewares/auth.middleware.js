import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

// Verifica el token JWT y guarda el usuario en req.user
export const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;

  // Si no hay token o no empieza con "Bearer "
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  // Extraer solo el token (quitar "Bearer ")
  const token = header.split(" ")[1];

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_secreto_jwt");

    // Verificar que el usuario existe y no está baneado
    const result = await pool.query(
      "SELECT id, name, email, role, is_banned FROM users WHERE id = $1",
      [decoded.id],
    );

    const user = result.rows[0];
    if (!user || user.is_banned) {
      return res.status(403).json({ message: "Tu cuenta no tiene acceso" });
    }

    req.user = user; // Guardar datos del usuario en la request
    next(); // Continuar al siguiente middleware o controlador
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
    next(error);
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Permisos de administrador requeridos" });
  }
  next();
};

// Middleware opcional: autenticación sin requerir token
export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_secreto_jwt");
    const result = await pool.query(
      "SELECT id, name, email, role, is_banned FROM users WHERE id = $1",
      [decoded.id],
    );
    req.user = result.rows[0] || null;
    if (req.user?.is_banned) req.user = null;
  } catch {
    req.user = null;
  }
  next();
};
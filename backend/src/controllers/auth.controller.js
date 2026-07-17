import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_jwt";

// Registro de nuevo usuario
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validar campos obligatorios
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const nameTrimed = name.trim();
    const emailTrimed = email.trim().toLowerCase();

    if (nameTrimed.length < 3) {
      return res.status(400).json({ message: "El nombre debe tener al menos 3 caracteres" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimed)) {
      return res.status(400).json({ message: "El correo no es válido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el email ya existe
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [emailTrimed]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Este correo ya está registrado" });
    }

    // Crear usuario con contraseña encriptada
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at`,
      [nameTrimed, emailTrimed, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

// Inicio de sesión
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const emailTrimed = email.trim().toLowerCase();

    // Buscar usuario por email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [emailTrimed]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario autenticado
export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil (nombre y email)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({ message: "Nombre y email son obligatorios" });
    }

    const nameTrimed = name.trim();
    const emailTrimed = email.trim().toLowerCase();

    if (nameTrimed.length < 3) {
      return res.status(400).json({ message: "El nombre debe tener al menos 3 caracteres" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimed)) {
      return res.status(400).json({ message: "El correo no es válido" });
    }

    // Verificar que el email no esté en uso por otro usuario
    const existing = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [emailTrimed, userId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Este correo ya está en uso" });
    }

    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, created_at",
      [nameTrimed, emailTrimed, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Contraseña actual y nueva son obligatorias" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, userId]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    next(error);
  }
};

// Eliminar cuenta
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
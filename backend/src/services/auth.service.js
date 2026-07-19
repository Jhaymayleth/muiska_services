import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "muiska_jwt_secret_dev_2024";

// Servicio de autenticación: toda la lógica de negocio + SQL relacionada con usuarios/auth
export const authService = {
  // Registrar nuevo usuario
  async register({ name, email, password }) {
    const nameTrimed = name.trim();
    const emailTrimed = email.trim().toLowerCase();

    // Verificar si email ya existe
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [emailTrimed]);
    if (existing.rows.length > 0) {
      const error = new Error("Este correo ya está registrado");
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at`,
      [nameTrimed, emailTrimed, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return { user, token };
  },

  // Iniciar sesión
  async login({ email, password }) {
    const emailTrimed = email.trim().toLowerCase();

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [emailTrimed]);
    if (result.rows.length === 0) {
      const error = new Error("Credenciales inválidas");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const user = result.rows[0];
    if (user.is_banned) {
      const error = new Error("Tu cuenta ha sido suspendida");
      error.code = "BANNED";
      throw error;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const error = new Error("Credenciales inválidas");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    };
  },

  // Obtener perfil del usuario autenticado
  async getMe(userId) {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      const error = new Error("Usuario no encontrado");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  // Actualizar perfil
  async updateProfile(userId, { name, email }) {
    const nameTrimed = name.trim();
    const emailTrimed = email.trim().toLowerCase();

    // Verificar si email ya está en uso por otro usuario
    const existing = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [emailTrimed, userId]);
    if (existing.rows.length > 0) {
      const error = new Error("Este correo ya está en uso");
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role, created_at",
      [nameTrimed, emailTrimed, userId]
    );
    return result.rows[0];
  },

  // Cambiar contraseña
  async changePassword(userId, { currentPassword, newPassword }) {
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      const error = new Error("Usuario no encontrado");
      error.code = "NOT_FOUND";
      throw error;
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      const error = new Error("Contraseña actual incorrecta");
      error.code = "INVALID_PASSWORD";
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, userId]);

    return { message: "Contraseña actualizada correctamente" };
  },

  // Eliminar cuenta
  async deleteAccount(userId) {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return { message: "Cuenta eliminada correctamente" };
  },
};
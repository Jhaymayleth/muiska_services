import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "muiska_jwt_secret_dev_2024";

// Servicio de autenticación: toda la lógica de negocio + SQL relacionada con usuarios/auth
export const authService = {
  // Registrar nuevo usuario
  async register({ name, email, password, tipoUsuario = "cliente" }) {
    const nameTrimed = name.trim();
    const emailTrimed = email.trim().toLowerCase();

    // Validar tipo_usuario
    const tiposValidos = ["cliente", "vendedor"];
    if (!tiposValidos.includes(tipoUsuario)) {
      const error = new Error("Tipo de usuario inválido");
      error.code = "INVALID_USER_TYPE";
      throw error;
    }

    // Verificar si email ya existe
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [emailTrimed]);
    if (existing.rows.length > 0) {
      const error = new Error("Este correo ya está registrado");
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    // Determinar estado de verificación inicial
    const estadoVerificacion = tipoUsuario === "vendedor" ? "pendiente" : "aprobado";
    const badgeVerificado = tipoUsuario === "cliente";

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, tipo_usuario, estado_verificacion, badge_verificado)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, tipo_usuario, estado_verificacion, badge_verificado, created_at`,
      [nameTrimed, emailTrimed, passwordHash, tipoUsuario, estadoVerificacion, badgeVerificado]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tipoUsuario: user.tipo_usuario },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
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
      { id: user.id, name: user.name, email: user.email, role: user.role, tipoUsuario: user.tipo_usuario },
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
      `SELECT id, name, email, role, tipo_usuario, estado_verificacion, badge_verificado,
              barrio_id, lat, lng, telefono, whatsapp, bio, foto_perfil_url,
              rating_promedio, total_reviews, created_at
       FROM users WHERE id = $1`,
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
  async updateProfile(userId, { name, email, telefono, whatsapp, bio, barrio_id, lat, lng }) {
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
      `UPDATE users SET name = $1, email = $2, telefono = $3, whatsapp = $4, bio = $5,
              barrio_id = $6, lat = $7, lng = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING id, name, email, role, tipo_usuario, estado_verificacion, badge_verificado,
                 barrio_id, lat, lng, telefono, whatsapp, bio, foto_perfil_url,
                 rating_promedio, total_reviews, created_at`,
      [nameTrimed, emailTrimed, telefono, whatsapp, bio, barrio_id, lat, lng, userId]
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
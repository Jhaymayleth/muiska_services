import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const JWT_SECRET = config.jwt.secret;

export const authService = {
  async register({ name, email, password, userType = "client" }) {
    const nameTrimed = name.trim();
    const emailTrimed = email.trim().toLowerCase();

    const validTypes = ["client", "seller"];
    if (!validTypes.includes(userType)) {
      const error = new Error("Invalid user type");
      error.code = "INVALID_USER_TYPE";
      throw error;
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [emailTrimed]);
    if (existing.rows.length > 0) {
      const error = new Error("Email already registered");
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    const verificationStatus = userType === "seller" ? "pending" : "approved";
    const isVerifiedBadge = false;

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, user_type, verification_status, is_verified_badge)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, user_type, verification_status, is_verified_badge, created_at`,
      [nameTrimed, emailTrimed, passwordHash, userType, verificationStatus, isVerifiedBadge]
    );

    const user = result.rows[0];

    if (userType === "seller") {
      await pool.query(
        `INSERT INTO verifications (user_id, status)
         VALUES ($1, 'pending')
         ON CONFLICT DO NOTHING`,
        [user.id]
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return { user, token };
  },

  async login({ email, password }) {
    const emailTrimed = email.trim().toLowerCase();

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [emailTrimed]);
    if (result.rows.length === 0) {
      const error = new Error("Invalid credentials");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const user = result.rows[0];
    if (user.is_banned) {
      const error = new Error("Account suspended");
      error.code = "BANNED";
      throw error;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const error = new Error("Invalid credentials");
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      // Los guards del frontend necesitan user_type y verification_status al
      // iniciar sesión; antes solo llegaban tras un GET /auth/me.
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        user_type: user.user_type,
        verification_status: user.verification_status,
        is_verified_badge: user.is_verified_badge,
        created_at: user.created_at,
      },
      token,
    };
  },

  async getMe(userId) {
    const result = await pool.query(
      `SELECT id, name, email, role, user_type, verification_status, is_verified_badge,
              neighborhood_id, lat, lng, phone, whatsapp, bio, profile_image_url,
              avg_rating, total_reviews, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      const error = new Error("User not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async updateProfile(userId, payload) {
    // Solo se actualizan los campos enviados: antes cualquier PUT que no trajera
    // teléfono/bio/barrio los dejaba en NULL.
    const fields = {
      name: payload.name?.trim(),
      email: payload.email?.trim().toLowerCase(),
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      bio: payload.bio,
      neighborhood_id: payload.neighborhoodId ?? payload.neighborhood_id,
      lat: payload.lat,
      lng: payload.lng,
    };

    if (fields.email) {
      const existing = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [fields.email, userId]);
      if (existing.rows.length > 0) {
        const error = new Error("Email already in use");
        error.code = "EMAIL_EXISTS";
        throw error;
      }
    }

    const sets = [];
    const values = [];
    for (const [column, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      values.push(value);
      sets.push(`${column} = $${values.length}`);
    }

    if (sets.length === 0) {
      const error = new Error("No fields to update");
      error.code = "NO_FIELDS";
      throw error;
    }

    values.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, email, role, user_type, verification_status, is_verified_badge,
                  neighborhood_id, lat, lng, phone, whatsapp, bio, profile_image_url,
                  avg_rating, total_reviews, created_at`,
      values
    );
    if (result.rows.length === 0) {
      const error = new Error("User not found");
      error.code = "NOT_FOUND";
      throw error;
    }
    return result.rows[0];
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
      const error = new Error("User not found");
      error.code = "NOT_FOUND";
      throw error;
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      const error = new Error("Current password incorrect");
      error.code = "INVALID_PASSWORD";
      throw error;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, userId]);

    return { message: "Password updated successfully" };
  },

  async deleteAccount(userId) {
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    return { message: "Account deleted successfully" };
  },
};
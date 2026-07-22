import { pool } from "../config/database.js";

export const barrioService = {
  async searchBarrios(query = "", limit = 20) {
    const result = await pool.query(
      `SELECT id, name, locality, lat, lng
       FROM neighborhoods
       WHERE name ILIKE $1
       ORDER BY name
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  },

  async getAllBarrios() {
    const result = await pool.query(
      `SELECT id, name, locality, lat, lng
       FROM neighborhoods
       ORDER BY locality, name`
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT id, name, locality, lat, lng
       FROM neighborhoods
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async getByLocality(locality) {
    const result = await pool.query(
      `SELECT id, name, locality, lat, lng
       FROM neighborhoods
       WHERE locality = $1
       ORDER BY name`,
      [locality]
    );
    return result.rows;
  },

  async getNearby(lat, lng, radiusKm = 5) {
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

    const result = await pool.query(
      `SELECT id, name, locality, lat, lng,
              ROUND(
                SQRT(POW(6371 * (lat - $1) * PI() / 180, 2) +
                     POW(6371 * ($2 - lng) * PI() / 180 * COS($1 * PI() / 180), 2)
                ) * 1000
              ) AS distance_meters
       FROM neighborhoods
       WHERE lat BETWEEN ($1 - $3) AND ($1 + $3)
         AND lng BETWEEN ($2 - $4) AND ($2 + $4)
       ORDER BY distance_meters ASC
       LIMIT 50`,
      [lat, lng, latDelta, lngDelta]
    );
    return result.rows;
  },
};

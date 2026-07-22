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
    const result = await pool.query(
      `SELECT id, name, locality, lat, lng,
              ROUND(ST_DistanceSphere(location, ST_MakePoint($2, $1))) AS distance_meters
       FROM neighborhoods
       WHERE ST_DWithin(location, ST_MakePoint($2, $1)::geography, $3 * 1000)
       ORDER BY distance_meters ASC
       LIMIT 50`,
      [lat, lng, radiusKm]
    );
    return result.rows;
  },
};

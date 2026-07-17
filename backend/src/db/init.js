import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const initializeDatabase = async ({ maxAttempts = 10 } = {}) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const sql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf-8");
      await pool.query(sql);
      console.log("Base de datos inicializada correctamente");
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error("Error al inicializar la base de datos:", error);
        throw error;
      }

      console.warn(`Esperando la base de datos... intento ${attempt}/${maxAttempts}`);
      await wait(2000);
    }
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  initializeDatabase().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

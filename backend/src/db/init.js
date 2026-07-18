import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const initDB = async () => {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "init.sql"),
      "utf-8"
    );
    await pool.query(sql);
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  } finally {
    await pool.end();
  }
};

initDB();

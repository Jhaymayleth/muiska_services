import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Configuración de la conexión a PostgreSQL
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5433/muiska",
});
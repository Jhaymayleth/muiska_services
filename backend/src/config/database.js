import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const getDatabaseConfig = (env = process.env) => ({
  host: env.DB_HOST || "localhost",
  port: Number(env.DB_PORT || 5432),
  database: env.DB_NAME || "muiska",
  user: env.DB_USER || "postgres",
  password: env.DB_PASSWORD || "postgres",
});

export const pool = new Pool(getDatabaseConfig());

import dotenv from "dotenv";

dotenv.config();

function getEnv(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvBoolean(key, defaultValue = false) {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

export const config = {
  env: getEnv("NODE_ENV", "development"),
  isProduction: getEnv("NODE_ENV") === "production",

  port: Number(getEnv("PORT", 3000)),

  db: {
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", 5433)),
    name: getEnv("DB_NAME", "muiska"),
    user: getEnv("DB_USER", "postgres"),
    password: getEnv("DB_PASSWORD", "postgres"),
  },

  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
  },

  cors: {
    origin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
  },

  upload: {
    maxFileSize: Number(getEnv("MAX_FILE_SIZE", 5 * 1024 * 1024)), // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },

  rateLimit: {
    windowMs: Number(getEnv("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000)),
    maxRequests: Number(getEnv("RATE_LIMIT_MAX", 100)),
  },
};
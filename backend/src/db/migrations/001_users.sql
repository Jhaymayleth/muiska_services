-- Migración 001: Crear tabla de usuarios
-- Esta es la primera migración, no tiene dependencias

-- Extensión para generar UUIDs aleatorios
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email (el UNIQUE ya crea índice, pero lo dejamos explícito)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
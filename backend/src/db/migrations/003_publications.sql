-- Migración 003: Crear tabla de publicaciones
-- Dependencias: users (001), categories (002)
-- NOTA: Usamos 'category' como VARCHAR temporal. 
-- La migración 004 lo cambiará a category_id FK

CREATE TABLE IF NOT EXISTS publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),  -- Temporal: se convertirá a FK en migración 004
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    location VARCHAR(255),
    contact_method VARCHAR(50),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_category ON publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at DESC);
-- Migración 004: Cambiar publications.category (VARCHAR) a category_id (UUID FK)
-- Dependencias: 001_users, 002_categories, 003_publications
-- Esta migración convierte el campo category (texto) en una FK real a categories.id

-- Paso 1: Agregar nueva columna category_id
ALTER TABLE publications 
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Paso 2: Poblar category_id haciendo JOIN con categories por nombre
-- Asumimos que los nombres en publications.category coinciden con categories.name
UPDATE publications p
SET category_id = c.id
FROM categories c
WHERE p.category = c.name
  AND p.category_id IS NULL;

-- Paso 3: Agregar Foreign Key
ALTER TABLE publications
ADD CONSTRAINT fk_publications_category
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Paso 4: Crear índice para la nueva FK
CREATE INDEX IF NOT EXISTS idx_publications_category_id ON publications(category_id);

-- NOTA: La columna 'category' (VARCHAR) se mantiene por compatibilidad temporal.
-- Se puede eliminar en una migración futura cuando todo el código use category_id.
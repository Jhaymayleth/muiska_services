CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  location VARCHAR(255),
  contact_method VARCHAR(50),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_category ON publications(category);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at DESC);

-- Credenciales de prueba para acceso administrativo y de usuario normal
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Administrador',
  'admin@admin.com',
  '$2b$10$C7LXRmskEUWkmydQ0tq/GOUtbV7NmMKt5lQ/Pot3tKVVB.e9OeLHW',
  'admin'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_banned = FALSE,
    updated_at = NOW();

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Usuario de Prueba',
  'user@user.com',
  '$2b$10$KhV9.gVAJqnhFZ7PCHRmZuWx9XnpHC2gvrlA9Zua323JlKfQhICga',
  'user'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_banned = FALSE,
    updated_at = NOW();

-- Categorías semilla para la plataforma
INSERT INTO categories (name, slug, description)
VALUES 
  ('Electrónica', 'electronica', 'Dispositivos electrónicos, computadoras, celulares y accesorios'),
  ('Ropa y Moda', 'ropa-moda', 'Ropa, calzado, accesorios y moda'),
  ('Hogar y Jardín', 'hogar-jardin', 'Muebles, decoración, electrodomésticos y jardinería'),
  ('Vehículos', 'vehiculos', 'Carros, motos, bicicletas y repuestos'),
  ('Inmuebles', 'inmuebles', 'Casas, apartamentos, locales y terrenos'),
  ('Servicios', 'servicios', 'Servicios profesionales, técnicos, de belleza y mantenimiento'),
  ('Mascotas', 'mascotas', 'Alimentos, accesorios y servicios para mascotas'),
  ('Deportes y Ocio', 'deportes-ocio', 'Equipamiento deportivo, juegos, libros y entretenimiento'),
  ('Salud y Belleza', 'salud-belleza', 'Productos de cuidado personal, cosméticos, salud'),
  ('Niños y Bebés', 'ninos-bebes', 'Ropa, juguetes, cochecitos y artículos para bebés'),
  ('Alimentos y Bebidas', 'alimentos-bebidas', 'Comida casera, postres, bebidas, productos artesanales'),
  ('Arte y Artesanía', 'arte-artesania', 'Obras de arte, manualidades, antigüedades, coleccionables'),
  ('Herramientas y Construcción', 'herramientas-construccion', 'Herramientas, materiales de construcción, ferretería'),
  ('Otros', 'otros', 'Artículos que no encajan en las categorías anteriores')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

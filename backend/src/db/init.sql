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

-- FASE 1: Campos usuarios + verificaciones + notificaciones (de migracion 006)
ALTER TABLE users ADD COLUMN IF NOT EXISTS tipo_usuario VARCHAR(20) DEFAULT 'cliente';
ALTER TABLE users ADD COLUMN IF NOT EXISTS estado_verificacion VARCHAR(20) DEFAULT 'pendiente';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verificado_por UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verificado_en TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS motivo_rechazo_verificacion TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS barrio_id UUID;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lat DECIMAL(10,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS lng DECIMAL(11,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS foto_perfil_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rating_promedio DECIMAL(3,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tiempo_respuesta_promedio INTERVAL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS badge_verificado BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS barrios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  localidad VARCHAR(50) NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD CONSTRAINT fk_users_barrio
  FOREIGN KEY (barrio_id) REFERENCES barrios(id);

CREATE TABLE IF NOT EXISTS verificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verificador_id UUID REFERENCES users(id),
  estado VARCHAR(20) NOT NULL,
  motivo TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verificaciones_usuario ON verificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_verificaciones_verificador ON verificaciones(verificador_id);
CREATE INDEX IF NOT EXISTS idx_verificaciones_estado ON verificaciones(estado);

CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSONB,
  leida BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_creado_en ON notificaciones(creado_en DESC);

-- FASE 2: Moderación de publicaciones
ALTER TABLE publications ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'producto';
ALTER TABLE publications ADD COLUMN IF NOT EXISTS estado_moderacion VARCHAR(20) DEFAULT 'pendiente';
ALTER TABLE publications ADD COLUMN IF NOT EXISTS moderado_por UUID REFERENCES users(id);
ALTER TABLE publications ADD COLUMN IF NOT EXISTS moderado_en TIMESTAMP;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS motivo_rechazo_moderacion TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS horario_atencion JSONB;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS area_cobertura JSONB;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS precio_tipo VARCHAR(20) DEFAULT 'fijo';

CREATE INDEX IF NOT EXISTS idx_publications_estado_moderacion ON publications(estado_moderacion);
CREATE INDEX IF NOT EXISTS idx_publications_tipo ON publications(tipo);

CREATE TABLE IF NOT EXISTS moderaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  verificador_id UUID REFERENCES users(id),
  accion VARCHAR(20) NOT NULL,
  motivo TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderaciones_publicacion ON moderaciones(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_moderaciones_verificador ON moderaciones(verificador_id);
CREATE INDEX IF NOT EXISTS idx_moderaciones_creado_en ON moderaciones(creado_en DESC);

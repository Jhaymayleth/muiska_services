-- FASE 1: Nuevos campos en users + tabla verificaciones + tabla notificaciones

-- 1. USUARIOS - Nuevos campos para roles y verificación (separados por ALTER TABLE)
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

-- 2. TABLA BARRIOS (se puebla en FASE 3, pero creamos la tabla ahora)
CREATE TABLE IF NOT EXISTS barrios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  localidad VARCHAR(50) NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agregar FK a users después de crear barrios
ALTER TABLE users ADD CONSTRAINT fk_users_barrio 
  FOREIGN KEY (barrio_id) REFERENCES barrios(id);

-- 3. VERIFICACIONES (Auditoría de verificación de perfiles)
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

-- 4. NOTIFICACIONES
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
-- FASE 2: Moderación de publicaciones

-- 1. Nuevos campos en publications
ALTER TABLE publications ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'producto';
ALTER TABLE publications ADD COLUMN IF NOT EXISTS estado_moderacion VARCHAR(20) DEFAULT 'pendiente';
ALTER TABLE publications ADD COLUMN IF NOT EXISTS moderado_por UUID REFERENCES users(id);
ALTER TABLE publications ADD COLUMN IF NOT EXISTS moderado_en TIMESTAMP;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS motivo_rechazo_moderacion TEXT;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS horario_atencion JSONB;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS area_cobertura JSONB;
ALTER TABLE publications ADD COLUMN IF NOT EXISTS precio_tipo VARCHAR(20) DEFAULT 'fijo';

-- 2. Tabla auditoría: moderaciones
CREATE TABLE IF NOT EXISTS moderaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  verificador_id UUID NOT NULL REFERENCES users(id),
  accion VARCHAR(20) NOT NULL CHECK (accion IN ('aprobada', 'rechazada')),
  motivo TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_moderaciones_publicacion ON moderaciones(publicacion_id);
CREATE INDEX IF NOT EXISTS idx_moderaciones_verificador ON moderaciones(verificador_id);
CREATE INDEX IF NOT EXISTS idx_moderaciones_creado_en ON moderaciones(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_publications_estado_moderacion ON publications(estado_moderacion);
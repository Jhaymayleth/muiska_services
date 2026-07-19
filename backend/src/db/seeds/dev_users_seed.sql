-- Seeds de desarrollo: usuarios de prueba
-- Ejecutar SOLO en entorno de desarrollo (docker-compose up lo hace automáticamente)
-- Contraseñas conocidas para pruebas:
--   admin@admin.com / admin123
--   user@user.com   / user123

-- Hash bcrypt de 'admin123' con costo 10
-- generado con: bcrypt.hash('admin123', 10)
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Administrador',
    'admin@admin.com',
    '$2b$10$QHVZBCu10wqaq5A.tQ9bV.wneTsaR3Iy9cGN7NWROYOM7t9FDQOKC',
    'admin'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_banned = FALSE,
    updated_at = NOW();

-- Hash bcrypt de 'user123' con costo 10
-- generado con: bcrypt.hash('user123', 10)
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Usuario de Prueba',
    'user@user.com',
    '$2b$10$xchvONlpgQKdm8GfRI6X.u2o7Iyysyl0PMxuTOY0mTk4DLK.u9Wgy',
    'user'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_banned = FALSE,
    updated_at = NOW();
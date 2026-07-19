-- Seeds de desarrollo: usuarios de prueba
-- Ejecutar SOLO en entorno de desarrollo (docker-compose up lo hace automáticamente)
-- Contraseñas conocidas para pruebas (coinciden con README.md):
--   admin@admin.com / Admin123!
--   user@user.com   / User123!

-- Hash bcrypt de 'Admin123!' con costo 10
-- generado con: bcrypt.hash('Admin123!', 10)
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Administrador',
    'admin@admin.com',
    '$2b$10$9D71vOEIqDlfBcRup0gyh.yAfBPPmG.SpoJ1NdlBFYJzp9B6G.sNy',
    'admin'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_banned = FALSE,
    updated_at = NOW();

-- Hash bcrypt de 'User123!' con costo 10
-- generado con: bcrypt.hash('User123!', 10)
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Usuario de Prueba',
    'user@user.com',
    '$2b$10$xnRJfMFErmtBk8EI5PLdqOvicNme7p7kMarzkocdqpDM4/.FLvRCS',
    'user'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_banned = FALSE,
    updated_at = NOW();
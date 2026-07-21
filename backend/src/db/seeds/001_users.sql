-- 001_users.sql
-- Seed: Demo users for development
-- Run ONLY in development environment
-- Passwords: admin@admin.com / Admin123! | user@user.com / User123!

-- Admin user
INSERT INTO users (name, email, password_hash, role, user_type, verification_status, is_verified_badge)
VALUES (
    'Administrator',
    'admin@admin.com',
    '$2b$10$C7LXRmskEUWkmydQ0tq/GOUtbV7NmMKt5lQ/Pot3tKVVB.e9OeLHW',
    'admin',
    'client',
    'approved',
    TRUE
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    user_type = EXCLUDED.user_type,
    verification_status = EXCLUDED.verification_status,
    is_verified_badge = EXCLUDED.is_verified_badge,
    is_banned = FALSE,
    updated_at = NOW();

-- Regular user
INSERT INTO users (name, email, password_hash, role, user_type, verification_status, is_verified_badge)
VALUES (
    'Test User',
    'user@user.com',
    '$2b$10$KhV9.gVAJqnhFZ7PCHRmZuWx9XnpHC2gvrlA9Zua323JlKfQhICga',
    'user',
    'client',
    'approved',
    FALSE
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    user_type = EXCLUDED.user_type,
    verification_status = EXCLUDED.verification_status,
    is_verified_badge = EXCLUDED.is_verified_badge,
    is_banned = FALSE,
    updated_at = NOW();
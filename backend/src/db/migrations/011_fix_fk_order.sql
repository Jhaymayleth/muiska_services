-- 011_fix_fk_order.sql
-- Reorder: index before FK for performance
-- The FK on users(neighborhood_id) was created before its index

ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_neighborhood;

CREATE INDEX IF NOT EXISTS idx_users_neighborhood_id ON users(neighborhood_id);

ALTER TABLE users ADD CONSTRAINT fk_users_neighborhood
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);

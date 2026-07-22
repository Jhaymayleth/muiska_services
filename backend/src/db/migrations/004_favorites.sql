-- 004_favorites.sql
-- Favorites table (many-to-many users <-> publications)
-- Dependencies: 001_users, 003_publications

CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, publication_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_publication_id ON favorites(publication_id);
-- 007_moderation.sql
-- Moderation audit table for publications
-- Dependencies: 001_users, 003_publications

CREATE TABLE moderations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moderations_publication_id ON moderations(publication_id);
CREATE INDEX idx_moderations_moderator_id ON moderations(moderator_id);
CREATE INDEX idx_moderations_created_at ON moderations(created_at DESC);
-- 008_conversations.sql
-- Chat conversations table
-- Dependencies: 001_users, 003_publications

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID REFERENCES publications(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(publication_id, buyer_id, seller_id)
);

CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_publication_id ON conversations(publication_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

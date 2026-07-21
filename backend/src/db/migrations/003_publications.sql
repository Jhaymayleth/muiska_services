-- 003_publications.sql
-- Publications table with moderation fields
-- Dependencies: 001_users, 002_categories

CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    location VARCHAR(255),
    contact_method VARCHAR(50),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    type VARCHAR(20) NOT NULL DEFAULT 'product',
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    rejection_reason TEXT,
    business_hours JSONB,
    coverage_area JSONB,
    price_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_publications_user_id ON publications(user_id);
CREATE INDEX idx_publications_category_id ON publications(category_id);
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_moderation_status ON publications(moderation_status);
CREATE INDEX idx_publications_type ON publications(type);
CREATE INDEX idx_publications_created_at ON publications(created_at DESC);
CREATE INDEX idx_publications_price ON publications(price);
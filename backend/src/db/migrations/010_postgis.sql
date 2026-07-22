-- 010_postgis.sql
-- Enable PostGIS extension for geospatial queries

CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to neighborhoods
ALTER TABLE neighborhoods ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Populate geography column from existing lat/lng
UPDATE neighborhoods
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
WHERE location IS NULL AND lat IS NOT NULL AND lng IS NOT NULL;

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_neighborhoods_location ON neighborhoods USING GIST (location);

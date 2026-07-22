-- Seed 002: Categories for the platform
-- Run ONLY in development environment

INSERT INTO categories (name, slug, description)
VALUES 
  ('Electronics', 'electronics', 'Electronic devices, computers, phones and accessories'),
  ('Clothing & Fashion', 'clothing-fashion', 'Clothing, footwear, accessories and fashion'),
  ('Home & Garden', 'home-garden', 'Furniture, decor, appliances and gardening'),
  ('Vehicles', 'vehicles', 'Cars, motorcycles, bicycles and parts'),
  ('Real Estate', 'real-estate', 'Houses, apartments, commercial spaces and land'),
  ('Services', 'services', 'Professional, technical, beauty and maintenance services'),
  ('Pets', 'pets', 'Food, accessories and services for pets'),
  ('Sports & Leisure', 'sports-leisure', 'Sports equipment, games, books and entertainment'),
  ('Health & Beauty', 'health-beauty', 'Personal care products, cosmetics, health'),
  ('Kids & Babies', 'kids-babies', 'Clothing, toys, strollers and baby items'),
  ('Food & Beverages', 'food-beverages', 'Homemade food, desserts, beverages, artisanal products'),
  ('Art & Crafts', 'art-crafts', 'Artwork, crafts, antiques, collectibles'),
  ('Tools & Construction', 'tools-construction', 'Tools, construction materials, hardware'),
  ('Other', 'other', 'Items that do not fit in other categories')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;
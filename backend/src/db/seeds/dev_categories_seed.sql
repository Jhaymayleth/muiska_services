-- Seed de categorías oficiales de Barranquilla
-- Ejecutar SOLO en entorno de desarrollo
INSERT INTO categories (name, slug, description)
VALUES 
  ('Electrónica', 'electronica', 'Productos electrónicos, celulares, computadores, accesorios'),
  ('Ropa y Moda', 'ropa-y-moda', 'Ropa, calzado, accesorios de moda'),
  ('Hogar y Decoración', 'hogar-y-decoracion', 'Muebles, decoración, artículos para el hogar'),
  ('Vehículos', 'vehiculos', 'Carros, motos, bicicletas, repuestos'),
  ('Inmuebles', 'inmuebles', 'Casas, apartamentos, terrenos, alquileres'),
  ('Servicios', 'servicios', 'Servicios profesionales, técnicos, domésticos'),
  ('Salud y Belleza', 'salud-y-belleza', 'Productos de salud, cosméticos, bienestar'),
  ('Deportes y Fitness', 'deportes-y-fitness', 'Artículos deportivos, gimnasio, outdoor'),
  ('Libros y Educación', 'libros-y-educacion', 'Libros, cursos, material educativo'),
  ('Mascotas', 'mascotas', 'Alimentos, accesorios, servicios para mascotas'),
  ('Juguetes y Niños', 'juguetes-y-ninos', 'Juguetes, ropa infantil, artículos para bebés'),
  ('Herramientas y Construcción', 'herramientas-y-construccion', 'Herramientas, materiales de construcción, ferretería'),
  ('Alimentos y Bebidas', 'alimentos-y-bebidas', 'Comida, bebidas, productos artesanales'),
  ('Arte y Artesanías', 'arte-y-artesanias', 'Obras de arte, artesanías, manualidades'),
  ('Otros', 'otros', 'Categorías no clasificadas')
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;
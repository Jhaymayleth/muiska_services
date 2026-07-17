// Utilidad para normalizar los datos de una publicación
export const normalizePublicationPayload = (payload = {}) => {
  // Limpiar strings y convertir a formato correcto
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const price = Number(payload.price);
  const category = typeof payload.category === "string" ? payload.category.trim() : "";
  const location = typeof payload.location === "string" ? payload.location.trim() : "";
  const contactMethod = typeof payload.contactMethod === "string" ? payload.contactMethod.trim() : "";

  // Filtrar imágenes vacías
  const images = Array.isArray(payload.images)
    ? payload.images.filter(Boolean).map((image) => String(image).trim())
    : [];

  return {
    title,
    description,
    price: Number.isFinite(price) ? price : 0,
    category: category || null,
    location: location || null,
    contact_method: contactMethod || null,
    images,
  };
};
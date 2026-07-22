export const normalizePublicationPayload = (payload = {}) => {
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  const price = Number(payload.price);
  const category =
    typeof payload.category === "string" ? payload.category.trim() : "";
  const location =
    typeof payload.location === "string" ? payload.location.trim() : "";
  const contactMethod =
    typeof payload.contactMethod === "string"
      ? payload.contactMethod.trim()
      : "";
  const images = Array.isArray(payload.images)
    ? payload.images.filter(Boolean).map((image) => String(image).trim())
    : [];

  return {
    title,
    description,
    price: Number.isFinite(price) && price > 0 ? price : undefined,
    category: category || null,
    location: location || null,
    contact_method: contactMethod || null,
    images,
    type: payload.type || "product",
    business_hours: payload.businessHours || null,
    coverage_area: payload.coverageArea || null,
    price_type: payload.priceType || "fixed",
  };
};

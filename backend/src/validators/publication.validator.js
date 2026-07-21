// Validaciones para publicaciones
// Movemos isValidPublicationPrice aquí y agregamos validaciones de create/update

const MAX_PUBLICATION_PRICE = 99_999_999.99;

export function isValidPublicationPrice(price) {
  return Number.isFinite(price) && price > 0 && price <= MAX_PUBLICATION_PRICE;
}

// Validar creación de publicación
export function validateCreatePublication({ title, description, price, category, location, contactMethod }) {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push("El título es obligatorio");
  }

  if (price === undefined || price === null) {
    errors.push("El precio es obligatorio");
  } else if (!isValidPublicationPrice(Number(price))) {
    errors.push("El precio debe ser mayor que 0 y no superar 99.999.999,99");
  }

  // Campos opcionales pero si se envían, validar
  if (category !== undefined && category !== null && category !== "" && typeof category !== "string") {
    errors.push("La categoría debe ser texto");
  }

  if (location !== undefined && location !== null && location !== "" && typeof location !== "string") {
    errors.push("La ubicación debe ser texto");
  }

  if (contactMethod !== undefined && contactMethod !== null && contactMethod !== "" && typeof contactMethod !== "string") {
    errors.push("El método de contacto debe ser texto");
  }

  return errors;
}

// Validar actualización de publicación
export function validateUpdatePublication({ title, description, price, category, location, contactMethod, status }) {
  const errors = [];

  if (title !== undefined && (!title || !title.trim())) {
    errors.push("El título no puede estar vacío");
  }

  if (price !== undefined) {
    if (!isValidPublicationPrice(Number(price))) {
      errors.push("El precio debe ser mayor que 0 y no superar 99.999.999,99");
    }
  }

  if (status !== undefined && status !== null && status !== "") {
    const validStatuses = ["active", "sold", "inactive"];
    if (!validStatuses.includes(status)) {
      errors.push("Estado inválido. Debe ser: active, sold o inactive");
    }
  }

  return errors;
}
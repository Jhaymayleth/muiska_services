// Validaciones para categorías

// Validar creación de categoría
export function validateCreateCategory({ name, description }) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push("El nombre es obligatorio");
  }

  if (description !== undefined && description !== null && description !== "" && typeof description !== "string") {
    errors.push("La descripción debe ser texto");
  }

  return errors;
}

// Validar actualización de categoría
export function validateUpdateCategory({ name, description }) {
  const errors = [];

  if (name !== undefined) {
    if (!name || !name.trim()) {
      errors.push("El nombre no puede estar vacío");
    }
  }

  if (description !== undefined && description !== null && description !== "" && typeof description !== "string") {
    errors.push("La descripción debe ser texto");
  }

  return errors;
}
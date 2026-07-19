// Validaciones para categorías
export function validateCreateCategory({ name, description }) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push("El nombre es obligatorio");
  } else if (name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  }

  return errors;
}

export function validateUpdateCategory({ name, description }) {
  const errors = [];

  if (name !== undefined) {
    if (!name || !name.trim()) {
      errors.push("El nombre no puede estar vacío");
    } else if (name.trim().length < 2) {
      errors.push("El nombre debe tener al menos 2 caracteres");
    }
  }

  return errors;
}
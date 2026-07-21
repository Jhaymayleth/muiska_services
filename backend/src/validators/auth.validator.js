// Validaciones para autenticación
// Separamos la lógica de validación de los controllers

// Validar registro de usuario
export function validateRegister({ name, email, password }) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push("El nombre es obligatorio");
  } else if (name.trim().length < 3) {
    errors.push("El nombre debe tener al menos 3 caracteres");
  }

  if (!email || !email.trim()) {
    errors.push("El correo es obligatorio");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("El correo no es válido");
    }
  }

  if (!password) {
    errors.push("La contraseña es obligatoria");
  } else if (password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres");
  }

  return errors;
}

// Validar inicio de sesión
export function validateLogin({ email, password }) {
  const errors = [];

  if (!email || !email.trim()) {
    errors.push("El correo es obligatorio");
  }

  if (!password) {
    errors.push("La contraseña es obligatoria");
  }

  return errors;
}

// Validar actualización de perfil
export function validateUpdateProfile({ name, email }) {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push("El nombre es obligatorio");
  } else if (name.trim().length < 3) {
    errors.push("El nombre debe tener al menos 3 caracteres");
  }

  if (!email || !email.trim()) {
    errors.push("El correo es obligatorio");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("El correo no es válido");
    }
  }

  return errors;
}

// Validar cambio de contraseña
export function validateChangePassword({ currentPassword, newPassword }) {
  const errors = [];

  if (!currentPassword) {
    errors.push("La contraseña actual es obligatoria");
  }

  if (!newPassword) {
    errors.push("La nueva contraseña es obligatoria");
  } else if (newPassword.length < 6) {
    errors.push("La nueva contraseña debe tener al menos 6 caracteres");
  }

  return errors;
}
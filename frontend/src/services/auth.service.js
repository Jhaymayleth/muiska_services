// Servicio de autenticación - llamadas a API de auth
// Separa la lógica de auth del cliente HTTP base (api.js)

import { api } from "./api.js";

// Login de usuario
export async function login(email, password) {
  return api.login(email, password);
}

// Registro de usuario
export async function register(userData) {
  return api.register(userData);
}

// Obtener perfil del usuario autenticado
export async function getMe() {
  return api.getMe();
}

// Actualizar perfil
export async function updateProfile(data) {
  return api.updateProfile(data);
}

// Cambiar contraseña
export async function changePassword(data) {
  return api.changePassword(data);
}

// Eliminar cuenta
export async function deleteAccount() {
  // No hay método directo en api.js, así que hacemos la llamada manual
  const token = localStorage.getItem("token");
  const res = await fetch("/api/auth/me", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error al eliminar cuenta" }));
    throw new Error(error.message);
  }
  return { message: "Cuenta eliminada correctamente" };
}

// Logout - limpia storage local
export function logout() {
  api.logout();
}
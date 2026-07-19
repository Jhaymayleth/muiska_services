// Servicio de publicaciones - llamadas a API de publicaciones
// Separa la lógica de publicaciones del cliente HTTP base (api.js)

import { api } from "./api.js";

// Obtener todas las publicaciones (con filtros y paginación)
export async function getPublications(params = {}) {
  return api.getPublications(params);
}

// Obtener una publicación por ID
export async function getPublication(id) {
  return api.getPublication(id);
}

// Obtener mis publicaciones
export async function getMyPublications() {
  return api.getMyPublications();
}

// Crear nueva publicación
export async function createPublication(data, images = []) {
  return api.createPublication(data, images);
}

// Actualizar publicación
export async function updatePublication(id, data, images = []) {
  return api.updatePublication(id, data, images);
}

// Eliminar publicación
export async function deletePublication(id) {
  return api.deletePublication(id);
}

// Obtener categorías
export async function getCategories() {
  return api.getCategories();
}
// Servicio de administración - llamadas a API de panel admin
import { api } from "./api.js";

// Obtener usuarios (admin)
export async function getAdminUsers(search = "") {
  return api.getAdminUsers(search);
}

// Actualizar usuario (admin)
export async function updateAdminUser(id, data) {
  return api.updateAdminUser(id, data);
}

// Eliminar usuario (admin)
export async function deleteAdminUser(id) {
  return api.deleteAdminUser(id);
}

// Obtener publicaciones (admin)
export async function getAdminPublications(params = {}) {
  return api.getAdminPublications(params);
}

// Actualizar publicación (admin)
export async function updateAdminPublication(id, data) {
  return api.updateAdminPublication(id, data);
}

// Eliminar publicación (admin)
export async function deleteAdminPublication(id) {
  return api.deleteAdminPublication(id);
}

// CRUD Categorías (admin usa los mismos endpoints que category.service)
export { getCategories, createCategory, updateCategory, deleteCategory } from "./publication.service.js";
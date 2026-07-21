// Publication service - API calls for publications
// Separates publication logic from base HTTP client (api.js)

import { api } from "./api.js";

// Get all publications (with filters and pagination)
export async function getPublications(params = {}) {
  return api.getPublications(params);
}

// Get publication by ID
export async function getPublication(id) {
  return api.getPublication(id);
}

// Get my publications
export async function getMyPublications() {
  return api.getMyPublications();
}

// Create new publication
export async function createPublication(data, images = []) {
  // Convert camelCase to snake_case for backend
  const snakeData = {};
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    snakeData[snakeKey] = value;
  });
  return api.createPublication(snakeData, images);
}

// Update publication
export async function updatePublication(id, data, images = []) {
  const snakeData = {};
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    snakeData[snakeKey] = value;
  });
  return api.updatePublication(id, snakeData, images);
}

// Delete publication
export async function deletePublication(id) {
  return api.deletePublication(id);
}

// Get categories
export async function getCategories() {
  return api.getCategories();
}

// ===== FAVORITES =====

// Toggle favorite (add/remove)
export async function toggleFavorite(publicationId) {
  return api.request(`/favorites/${publicationId}/toggle`, {
    method: "POST",
  });
}

// List my favorites (paginated)
export async function getFavorites(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  return api.request(`/favorites?${query.toString()}`);
}

// Check if publication is favorite
export async function checkFavorite(publicationId) {
  return api.request(`/favorites/${publicationId}/check`);
}
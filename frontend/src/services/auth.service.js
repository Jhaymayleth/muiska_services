// Auth service - API calls for authentication
// Separates auth logic from base HTTP client (api.js)

import { api } from "./api.js";

// User login
export async function login(email, password) {
  return api.login(email, password);
}

// User registration
export async function register(userData) {
  return api.register(userData);
}

// Get authenticated user profile
export async function getMe() {
  return api.getMe();
}

// Update profile
export async function updateProfile(data) {
  // Convert camelCase to snake_case for backend
  const snakeData = {};
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    snakeData[snakeKey] = value;
  });
  return api.updateProfile(snakeData);
}

// Change password
export async function changePassword(data) {
  return api.changePassword(data);
}

// Delete account
export async function deleteAccount() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/auth/me", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error deleting account" }));
    throw new Error(error.message);
  }
  return { message: "Account deleted successfully" };
}

// Logout - clears local storage
export function logout() {
  api.logout();
}
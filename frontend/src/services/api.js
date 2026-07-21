const API_BASE = "/api";

export const api = {
  async request(path, options = {}) {
    const token = localStorage.getItem("token");
    const headers = { ...options.headers };

    // Don't set Content-Type for FormData - browser sets it with boundary
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Error en la solicitud");
    }
    return res.json();
  },

  getPublications(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    return this.request(`/publications?${query.toString()}`);
  },

  getMyPublications() {
    return this.request("/publications/mine");
  },

  getPublication(id) {
    return this.request(`/publications/${id}`);
  },

  createPublication(data, images = []) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    images.forEach((image) => formData.append("images", image));

    return this.request("/publications", {
      method: "POST",
      body: formData,
    });
  },

  updatePublication(id, data, images = []) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    images.forEach((image) => formData.append("images", image));

    return this.request(`/publications/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  deletePublication(id) {
    return this.request(`/publications/${id}`, {
      method: "DELETE",
    });
  },

  login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(data) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return this.request("/auth/me");
  },

  updateProfile(data) {
    return this.request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  changePassword(data) {
    return this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getCategories() {
    return this.request("/categories");
  },

  getAdminUsers(search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request(`/admin/users${query}`);
  },

  updateAdminUser(id, data) {
    return this.request(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAdminUser(id) {
    return this.request(`/admin/users/${id}`, { method: "DELETE" });
  },

  // Admin - Publications
  getAdminPublications(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    return this.request(`/admin/publications?${query.toString()}`);
  },

  updateAdminPublication(id, data) {
    return this.request(`/admin/publications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAdminPublication(id) {
    return this.request(`/admin/publications/${id}`, { method: "DELETE" });
  },

  // Admin - Categories
  createCategory(data) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateCategory(id, data) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteCategory(id) {
    return this.request(`/categories/${id}`, { method: "DELETE" });
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Notificaciones
  getNotifications(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    return this.request(`/notificaciones?${query.toString()}`);
  },

  markNotificationRead(id) {
    return this.request(`/notificaciones/${id}/leer`, { method: "PATCH" });
  },

  markAllNotificationsRead() {
    return this.request("/notificaciones/leer-todas", { method: "POST" });
  },

  deleteNotification(id) {
    return this.request(`/notificaciones/${id}`, { method: "DELETE" });
  },

  // Verificaciones
  getMyVerificationStatus() {
    return this.request("/verificaciones/mi-estado");
  },

  getPendingVerifications() {
    return this.request("/verificaciones/pendientes");
  },

  getVerificationById(id) {
    return this.request(`/verificaciones/${id}`);
  },

  approveVerification(id) {
    return this.request(`/verificaciones/${id}/aprobar`, { method: "POST" });
  },

  rejectVerification(id, motivo) {
    return this.request(`/verificaciones/${id}/rechazar`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    });
  },

  getMyVerificationHistory() {
    return this.request("/verificaciones/historial/mio");
  },

  // Admin - Verificadores
  getVerificadores() {
    return this.request("/admin/verificadores");
  },

  assignVerifier(id) {
    return this.request(`/admin/verificadores/${id}`, { method: "POST" });
  },

  removeVerifier(id) {
    return this.request(`/admin/verificadores/${id}`, { method: "DELETE" });
  },
};

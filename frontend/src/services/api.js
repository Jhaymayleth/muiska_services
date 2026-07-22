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
      const e = new Error(error.message || "Request failed");
      if (error.details) e.details = error.details;
      throw e;
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
    // Convert camelCase to snake_case
    const snakeData = {};
    Object.entries(data).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      snakeData[snakeKey] = value;
    });
    return this.request("/auth/me", {
      method: "PUT",
      body: JSON.stringify(snakeData),
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

  getCategory(id) {
    return this.request(`/categories/${id}`);
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

  // Admin - Categories
  getAdminCategories() {
    return this.request("/admin/categories");
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

  // Notifications
  getNotifications(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    return this.request(`/notifications?${query.toString()}`);
  },

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: "PATCH" });
  },

  markAllNotificationsRead() {
    return this.request("/notifications/read-all", { method: "POST" });
  },

  deleteNotification(id) {
    return this.request(`/notifications/${id}`, { method: "DELETE" });
  },

  // Verifications
  getMyVerificationStatus() {
    return this.request("/verifications/my-status");
  },

  getPendingVerifications() {
    return this.request("/verifications/pending");
  },

  getVerificationById(id) {
    return this.request(`/verifications/${id}`);
  },

  approveVerification(id) {
    return this.request(`/verifications/${id}/approve`, { method: "POST" });
  },

  rejectVerification(id, reason) {
    return this.request(`/verifications/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  getMyVerificationHistory() {
    return this.request("/verifications/my-history");
  },

  // Moderation (for verifiers)
  getPendingPublications(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    return this.request(`/moderation/pending?${query.toString()}`);
  },

  approvePublication(id) {
    return this.request(`/moderation/${id}/approve`, { method: "POST" });
  },

  rejectPublication(id, reason) {
    return this.request(`/moderation/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  getMyModerations() {
    return this.request("/moderation/history/me");
  },

  // Public seller profile
  getPublicProfile(sellerId) {
    return this.request(`/users/${sellerId}/profile`);
  },

  // Admin - Verifiers
  getVerifiers() {
    return this.request("/admin/verifiers");
  },

  assignVerifier(id) {
    return this.request(`/admin/verifiers/${id}`, { method: "POST" });
  },

  removeVerifier(id) {
    return this.request(`/admin/verifiers/${id}`, { method: "DELETE" });
  },

  // Chat
  getConversations() {
    return this.request("/conversations");
  },

  getConversation(id) {
    return this.request(`/conversations/${id}`);
  },

  getMessages(conversationId, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });
    return this.request(`/conversations/${conversationId}/messages?${query.toString()}`);
  },

  createConversation(publicationId, sellerId) {
    return this.request("/conversations", {
      method: "POST",
      body: JSON.stringify({ publicationId, sellerId }),
    });
  },

  markMessagesRead(conversationId) {
    return this.request(`/conversations/${conversationId}/read`, { method: "POST" });
  },

  sendMessage(conversationId, content) {
    return this.request(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  // Reviews
  getPublicationReviews(publicationId) {
    return this.request(`/publications/${publicationId}/reviews`);
  },

  createReview(publicationId, { rating, comment }) {
    return this.request(`/publications/${publicationId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    });
  },

  getMyReviews() {
    return this.request("/reviews/me");
  },

  // Push notifications
  getPushPublicKey() {
    return this.request("/push/public-key");
  },

  subscribePush(subscription) {
    return this.request("/push/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    });
  },

  unsubscribePush(endpoint) {
    return this.request("/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint }),
    });
  },

  // Neighborhoods
  searchNeighborhoods(q = "", limit = 20) {
    return this.request(`/neighborhoods/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  },

  searchBarrios(q = "", limit = 20) {
    return this.request(`/neighborhoods/search?q=${encodeURIComponent(q)}&limit=${limit}`);
  },

  getAllNeighborhoods() {
    return this.request("/neighborhoods");
  },

  getNeighborhood(id) {
    return this.request(`/neighborhoods/${id}`);
  },
};
const API_BASE = "http://localhost:3000/api";

export const api = {
  async request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message);
    }
    return res.json();
  },

  getPublications() {
    return this.request("/publications");
  },

  getPublication(id) {
    return this.request(`/publications/${id}`);
  },

  createPublication(data) {
    return this.request("/publications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePublication(id, data) {
    return this.request(`/publications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePublication(id) {
    return this.request(`/publications/${id}`, {
      method: "DELETE",
    });
  },
};

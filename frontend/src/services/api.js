const API_BASE = "/api";

export const api = {
  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    const token = localStorage.getItem("token");
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

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

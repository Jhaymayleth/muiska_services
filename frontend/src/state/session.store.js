// Almacén de sesión centralizado
// Centraliza todo el acceso a localStorage/sessionStorage relacionado con autenticación
// Evita dispersión de lógica de almacenamiento en utils/auth.js y componentes

export const sessionStore = {
  // Claves de localStorage
  KEYS: {
    TOKEN: "token",
    USER: "user",
  },

  // ===== TOKEN =====
  getToken: () => localStorage.getItem(sessionStore.KEYS.TOKEN),

  setToken: (token) => {
    if (token) {
      localStorage.setItem(sessionStore.KEYS.TOKEN, token);
    }
  },

  clearToken: () => {
    localStorage.removeItem(sessionStore.KEYS.TOKEN);
  },

  // ===== USER =====
  getUser: () => {
    const data = localStorage.getItem(sessionStore.KEYS.USER);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(sessionStore.KEYS.USER, JSON.stringify(user));
    }
  },

  clearUser: () => {
    localStorage.removeItem(sessionStore.KEYS.USER);
  },

  // ===== HELPERS DE ESTADO =====
  isAuthenticated: () => !!sessionStore.getToken(),

  getRole: () => sessionStore.getUser()?.role || null,

  getUserId: () => sessionStore.getUser()?.id || null,

  getUserName: () => sessionStore.getUser()?.name || null,

  isAdmin: () => sessionStore.getRole() === "admin",

  // ===== LIMPIEZA COMPLETA (logout) =====
  clearAll: () => {
    sessionStore.clearToken();
    sessionStore.clearUser();
  },

  logout: () => {
    sessionStore.clearAll();
    window.location.href = "/login";
  },

  // ===== INICIALIZAR DESDE STORAGE (útil al cargar app) =====
  hydrate: () => {
    // No hace falta lógica extra, los getters leen directo de localStorage
    // Este método existe por si en el futuro se quiere migrar a sessionStorage o IndexedDB
    return {
      token: sessionStore.getToken(),
      user: sessionStore.getUser(),
    };
  },
};
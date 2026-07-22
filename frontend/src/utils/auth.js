import { sessionStore } from "../state/session.store.js";

// ===== WRAPPERS PARA COMPATIBILIDAD HACIA ATRÁS =====
// Estos usan sessionStore internamente, manteniendo la misma API

export const isAuthenticated = () => sessionStore.isAuthenticated();

export const getUser = () => sessionStore.getUser();

export const isAdmin = () => sessionStore.isAdmin();

export const isVerifier = () => sessionStore.getRole() === "verifier";

// Logout usando sessionStore + redirección
export const logout = () => sessionStore.logout();

// ===== RUTAS PROTEGIDAS / GUEST =====

// Rutas que requieren autenticación
export const protectedRoutes = [
  "/dashboard",
  "/create",
  "/edit",
  "/profile",
  "/admin",
  "/chat",
  "/verifier-dashboard",
  "/verificador-dashboard",
];

// Rutas que no deben estar disponibles si ya estás autenticado
export const guestRoutes = ["/login", "/register"];

export const isRouteProtected = (path) => {
  return protectedRoutes.some((route) => {
    if (route.includes(":")) {
      const pattern = route.replace(/:.*/, "");
      return path.startsWith(pattern);
    }
    return path === route || path.startsWith(route + "/");
  });
};

export const isGuestRoute = (path) => {
  return guestRoutes.includes(path);
};

// Exportar sessionStore para uso directo si se necesita
export { sessionStore };
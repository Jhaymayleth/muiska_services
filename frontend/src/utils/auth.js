import { sessionStore } from "../state/session.store.js";

// ===== WRAPPERS PARA COMPATIBILIDAD HACIA ATRÁS =====
// Estos usan sessionStore internamente, manteniendo la misma API

export const isAuthenticated = () => sessionStore.isAuthenticated();

export const getUser = () => sessionStore.getUser();

export const isAdmin = () => sessionStore.isAdmin();

// Logout usando sessionStore + redirección
export const logout = () => sessionStore.logout();

// ===== RUTAS PROTEGIDAS / GUEST =====

// Rutas que requieren autenticación
export const protectedRoutes = [
  "/dashboard",
  "/crear-publicacion",
  "/editar-publicacion",
  "/perfil",
  "/admin",
];

// Rutas que no deben estar disponibles si ya estás autenticado
export const guestRoutes = ["/login", "/registro"];

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
// auth.js - Utilidades de autenticación del frontend
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// Rutas que requieren estar logueado
export const protectedRoutes = [
  "/crear-publicacion",
  "/editar-publicacion",
  "/admin",
];

// Rutas solo para invitados (no logueados)
export const guestRoutes = ["/login", "/registro"];

// Verifica si una ruta necesita autenticación
export const isRouteProtected = (path) => {
  return protectedRoutes.some((route) => {
    if (route.includes(":")) {
      const pattern = route.replace(/:.*/, "");
      return path.startsWith(pattern);
    }
    return path === route || path.startsWith(route + "/");
  });
};

// Verifica si es ruta de invitado
export const isGuestRoute = (path) => {
  return guestRoutes.includes(path);
};
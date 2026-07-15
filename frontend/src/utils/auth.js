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

// Rutas que requieren autenticación
export const protectedRoutes = [
  "/dashboard",
  "/crear-publicacion",
  "/editar-publicacion",
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

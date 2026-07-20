import HomePage from "../pages/HomePage.js";
import ExplorePage from "../pages/ExplorePage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import DashboardPage from "../pages/dashboard/DashboardPage.js";
import AdminPage from "../pages/admin/AdminPage.js";
import CreateListingPage from "../pages/CreateListingPage.js";
import EditListingPage from "../pages/EditListingPage.js";
import PublicationDetailPage from "../pages/PublicationDetailPage.js";
import ProfilePage from "../pages/ProfilePage.js";
import VerificacionPendientePage from "../pages/VerificacionPendientePage.js";
import NotFoundPage from "../pages/NotFoundPage.js";
import { isAuthenticated, isAdmin, isRouteProtected, isGuestRoute, getUser, sessionStore } from "../utils/auth.js";

const routes = {
  "/": HomePage,
  "/explorar": ExplorePage,
  "/login": LoginPage,
  "/registro": RegisterPage,
  "/dashboard": DashboardPage,
  "/admin": AdminPage,
  "/crear-publicacion": CreateListingPage,
  "/perfil": ProfilePage,
  "/verificacion-pendiente": VerificacionPendientePage,
};

const dynamicRoutes = [
  { pattern: /^\/editar-publicacion\/(.+)$/, component: EditListingPage },
  { pattern: /^\/publicacion\/(.+)$/, component: PublicationDetailPage },
  { pattern: /^\/dashboard\/favoritos$/, component: DashboardPage },
];

export const navigateTo = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const checkAuth = (path) => {
  // Si es ruta de guest (login/registro) y ya está autenticado, redirigir a dashboard
  if (isGuestRoute(path) && isAuthenticated()) {
    navigateTo("/dashboard");
    return false;
  }

  // Si es ruta protegida y no está autenticado, redirigir a login
  if (isRouteProtected(path) && !isAuthenticated()) {
    navigateTo("/login");
    return false;
  }

  // Si es /admin y no es admin, redirigir a dashboard
  if (path === "/admin" && !isAdmin()) {
    navigateTo("/dashboard");
    return false;
  }

  // Redirigir vendedor no verificado a /verificacion-pendiente (excepto si ya está ahí)
  const user = getUser();
  if (user && user.tipo_usuario === "vendedor" && user.estado_verificacion !== "aprobado") {
    const allowedPaths = ["/verificacion-pendiente", "/perfil", "/login", "/registro", "/explorar", "/"];
    if (!allowedPaths.includes(path) && !path.startsWith("/publicacion/")) {
      navigateTo("/verificacion-pendiente");
      return false;
    }
  }

  return true;
};

export const renderRoute = async (container) => {
  const path = window.location.pathname || "/";

  // Verificar autenticación antes de renderizar
  if (!checkAuth(path)) {
    return;
  }

  const Page = routes[path];
  if (Page) {
    container.replaceChildren(await Page());
    return;
  }

  for (const { pattern, component } of dynamicRoutes) {
    if (pattern.test(path)) {
      container.replaceChildren(await component());
      return;
    }
  }

  container.replaceChildren(await NotFoundPage());
};
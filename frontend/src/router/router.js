// Router simple basado en history API
import HomePage from "../pages/HomePage.js";
import ExplorePage from "../pages/ExplorePage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import DashboardPage from "../pages/DashboardPage.js";
import AdminPage from "../pages/AdminPage.js";
import CreateListingPage from "../pages/CreateListingPage.js";
import EditListingPage from "../pages/EditListingPage.js";
import PublicationDetailPage from "../pages/PublicationDetailPage.js";
import ProfilePage from "../pages/ProfilePage.js";
import NotFoundPage from "../pages/NotFoundPage.js";

// Rutas estáticas
const routes = {
  "/": HomePage,
  "/explorar": ExplorePage,
  "/login": LoginPage,
  "/registro": RegisterPage,
  "/dashboard": DashboardPage,
  "/admin": AdminPage,
  "/crear-publicacion": CreateListingPage,
  "/perfil": ProfilePage,
};

// Rutas dinámicas con parámetros
const dynamicRoutes = [
  { pattern: /^\/editar-publicacion\/(.+)$/, component: EditListingPage },
  { pattern: /^\/publicacion\/(.+)$/, component: PublicationDetailPage },
];

// Navegar cambiando la URL sin recargar
export const navigateTo = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

// Renderizar la página correspondiente
export const renderRoute = (container) => {
  const path = window.location.pathname || "/";

  // Rutas exactas
  const Page = routes[path];
  if (Page) {
    container.replaceChildren(Page());
    return;
  }

  // Rutas dinámicas
  for (const { pattern, component } of dynamicRoutes) {
    if (pattern.test(path)) {
      container.replaceChildren(component());
      return;
    }
  }

  // 404
  container.replaceChildren(NotFoundPage());
};

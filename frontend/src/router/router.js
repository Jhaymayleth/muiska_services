import HomePage from "../pages/HomePage.js";
import ExplorePage from "../pages/ExplorePage.js";
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import AdminPage from "../pages/AdminPage.js";
import CreateListingPage from "../pages/CreateListingPage.js";
import EditListingPage from "../pages/EditListingPage.js";
import PublicationDetailPage from "../pages/PublicationDetailPage.js";
import ProfilePage from "../pages/ProfilePage.js";
import NotFoundPage from "../pages/NotFoundPage.js";

const routes = {
  "/": HomePage,
  "/explorar": ExplorePage,
  "/login": LoginPage,
  "/registro": RegisterPage,
  "/admin": AdminPage,
  "/crear-publicacion": CreateListingPage,
  "/perfil": ProfilePage,
};

const dynamicRoutes = [
  { pattern: /^\/editar-publicacion\/(.+)$/, component: EditListingPage },
  { pattern: /^\/publicacion\/(.+)$/, component: PublicationDetailPage },
];

export const navigateTo = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const renderRoute = (container) => {
  const path = window.location.pathname || "/";
  const Page = routes[path];
  if (Page) {
    container.replaceChildren(Page());
    return;
  }
  for (const { pattern, component } of dynamicRoutes) {
    if (pattern.test(path)) {
      container.replaceChildren(component());
      return;
    }
  }
  container.replaceChildren(NotFoundPage());
};

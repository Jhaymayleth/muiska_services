import HomePage from "../pages/home/HomePage.js";
import ExplorePage from "../pages/explore/ExplorePage.js";
import LoginPage from "../pages/login/LoginPage.js";
import RegisterPage from "../pages/register/RegisterPage.js";
import DashboardPage from "../pages/dashboard/DashboardPage.js";
import AdminPage from "../pages/admin/AdminPage.js";
import CreateListingPage from "../pages/create-listing/CreateListingPage.js";
import EditListingPage from "../pages/edit-listing/EditListingPage.js";
import PublicationDetailPage from "../pages/publication-detail/PublicationDetailPage.js";
import ProfilePage from "../pages/profile/ProfilePage.js";
import NotFoundPage from "../pages/not-found/NotFoundPage.js";

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

import HomePage from "../pages/home/HomePage.js";
import ExplorePage from "../pages/explore/ExplorePage.js";
import LoginPage from "../pages/login/LoginPage.js";
import RegisterPage from "../pages/register/RegisterPage.js";
import DashboardPage from "../pages/dashboard/DashboardPage.js";
import AdminPage from "../pages/admin/AdminPage.js";
import CreateListingPage from "../pages/create-listing/CreateListingPage.js";
import NotFoundPage from "../pages/not-found/NotFoundPage.js";

const routes = {
  "/": HomePage,
  "/explorar": ExplorePage,
  "/login": LoginPage,
  "/registro": RegisterPage,
  "/dashboard": DashboardPage,
  "/admin": AdminPage,
  "/crear-publicacion": CreateListingPage,
};

export const navigateTo = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

export const renderRoute = (container) => {
  const path = window.location.pathname || "/";
  const Page = routes[path] || NotFoundPage;
  container.replaceChildren(Page());
};

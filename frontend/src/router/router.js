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
import VerificationPendingPage from "../pages/VerificationPendingPage.js";
import NotFoundPage from "../pages/NotFoundPage.js";
import { isAuthenticated, isAdmin, isRouteProtected, isGuestRoute, getUser, sessionStore } from "../utils/auth.js";

const routes = {
  "/": HomePage,
  "/explore": ExplorePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/dashboard": DashboardPage,
  "/admin": AdminPage,
  "/create": CreateListingPage,
  "/profile": ProfilePage,
  "/verification-pending": VerificationPendingPage,
};

const dynamicRoutes = [
  { pattern: /^\/edit\/(.+)$/, component: EditListingPage },
  { pattern: /^\/listing\/(.+)$/, component: PublicationDetailPage },
  { pattern: /^\/dashboard\/favorites$/, component: DashboardPage },
];

export const navigateTo = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const checkAuth = (path) => {
  // If guest route (login/register) and already authenticated, redirect to dashboard
  if (isGuestRoute(path) && isAuthenticated()) {
    navigateTo("/dashboard");
    return false;
  }

  // If protected route and not authenticated, redirect to login
  if (isRouteProtected(path) && !isAuthenticated()) {
    navigateTo("/login");
    return false;
  }

  // If /admin and not admin, redirect to dashboard
  if (path === "/admin" && !isAdmin()) {
    navigateTo("/dashboard");
    return false;
  }

  // Redirect unverified seller to /verification-pending (except if already there)
  const user = getUser();
  if (user && user.user_type === "seller" && user.verification_status !== "approved") {
    const allowedPaths = ["/verification-pending", "/profile", "/login", "/register", "/explore", "/"];
    if (!allowedPaths.includes(path) && !path.startsWith("/listing/")) {
      navigateTo("/verification-pending");
      return false;
    }
  }

  return true;
};

export const renderRoute = async (container) => {
  const path = window.location.pathname || "/";

  // Verify auth before rendering
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
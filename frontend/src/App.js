import { renderRoute, navigateTo } from "./router/router.js";
import Navbar from "./components/layout/Navbar.js";
import Footer from "./components/layout/Footer.js";
import { isAuthenticated, isRouteProtected, isGuestRoute, getUser } from "./utils/auth.js";

const App = () => {
  const app = document.createElement("div");
  app.className = "min-h-screen flex flex-col bg-background text-text";

  const main = document.createElement("main");
  main.id = "page-view";

  const layout = document.createElement("div");
  layout.className = "mx-auto flex min-h-screen w-full max-w-7xl flex-col";

  const isHome = () => window.location.pathname === "/";

  const redirectBasedOnRole = () => {
    const user = getUser();
    if (!user) return;

    const pathname = window.location.pathname;

    if (user.role === "admin" && pathname === "/dashboard") {
      navigateTo("/admin");
    } else if (user.role === "user" && pathname === "/admin") {
      navigateTo("/");
    }
  };

  const render = () => {
    const path = window.location.pathname;

    // Proteger rutas que requieren autenticación
    if (isRouteProtected(path) && !isAuthenticated()) {
      navigateTo("/login");
      return;
    }

    // Redirigir a home si ya está autenticado e intenta ir a login/registro
    if (isGuestRoute(path) && isAuthenticated()) {
      const user = getUser();
      if (user?.role === "admin") {
        navigateTo("/admin");
      } else {
        navigateTo("/");
      }
      return;
    }

    // Redirigir según rol
    if (isAuthenticated()) {
      redirectBasedOnRole();
    }

    layout.innerHTML = "";
    if (isHome()) {
      main.className = "flex-1";
      layout.appendChild(main);
    } else {
      main.className = "flex-1 px-4 py-8 md:px-8";
      layout.appendChild(Navbar());
      layout.appendChild(main);
      layout.appendChild(Footer());
    }
    renderRoute(main);
  };

  layout.appendChild(main);
  if (!isHome()) {
    layout.prepend(Navbar());
    layout.appendChild(Footer());
  }
  app.appendChild(layout);

  window.addEventListener("popstate", render);
  render();

  return app;
}

export default App;

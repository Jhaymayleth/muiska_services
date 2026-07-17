// App.js - Componente principal de la aplicación
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

  // Redirigir según rol
  const redirectBasedOnRole = () => {
    const user = getUser();
    if (!user) return;

    const pathname = window.location.pathname;

    // Admin en home -> admin
    if (user.role === "admin" && pathname === "/") {
      navigateTo("/admin");
    }
    // Usuario normal en admin -> home
    else if (user.role === "user" && pathname === "/admin") {
      navigateTo("/");
    }
  };

  const render = () => {
    const path = window.location.pathname;

    // 1. Proteger rutas que requieren login
    if (isRouteProtected(path) && !isAuthenticated()) {
      navigateTo("/login");
      return;
    }

    // 2. Si logueado va a login/registro -> redirigir
    if (isGuestRoute(path) && isAuthenticated()) {
      const user = getUser();
      if (user?.role === "admin") {
        navigateTo("/admin");
      } else {
        navigateTo("/");
      }
      return;
    }

    // 3. Redirigir según rol
    if (isAuthenticated()) {
      redirectBasedOnRole();
    }

    // Renderizar layout
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

  // Escuchar cambios de URL (back/forward)
  window.addEventListener("popstate", render);
  render();

  return app;
};

export default App;
import { renderRoute } from "./router/router.js";
import Navbar from "./components/layout/Navbar.js";
import Footer from "./components/layout/Footer.js";

// Rutas que manejan su propio ancho y padding (hero full-bleed).
const FULL_BLEED_ROUTES = new Set(["/", "/login", "/register"]);

const isModifiedClick = (event) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const scrollToHash = () => {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const App = () => {
  const app = document.createElement("div");
  app.className = "flex min-h-screen flex-col bg-background text-text";

  const skipLink = document.createElement("a");
  skipLink.href = "#page-view";
  skipLink.className = "skip-link";
  skipLink.textContent = "Skip to content";

  const main = document.createElement("main");
  main.id = "page-view";
  main.tabIndex = -1;
  main.className = "flex-1";

  app.append(skipLink, main);

  const render = async () => {
    const path = window.location.pathname || "/";

    // El navbar se reconstruye en cada navegación para refrescar sesión y
    // estado activo; el footer es estable.
    main.replaceChildren();
    main.className = FULL_BLEED_ROUTES.has(path)
      ? "flex-1"
      : "mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8";

    app.replaceChildren(skipLink, Navbar(), main, Footer());
    await renderRoute(main);

    // Las rutas con ancla (por ejemplo /#Categories) hacen scroll tras montar.
    if (window.location.hash) {
      requestAnimationFrame(scrollToHash);
    }
  };

  // Delegación global: cualquier enlace interno navega sin recargar la SPA.
  document.addEventListener("click", (event) => {
    if (isModifiedClick(event)) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    if (
      !href ||
      !href.startsWith("/") ||
      href.startsWith("//") ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return;
    }

    event.preventDefault();
    if (href !== `${window.location.pathname}${window.location.search}`) {
      window.history.pushState({}, "", href);
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  window.addEventListener("popstate", () => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    render();
  });

  render();

  return app;
};

export default App;

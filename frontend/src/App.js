import { renderRoute } from "./router/router.js";
import Navbar from "./components/layout/Navbar.js";
import Footer from "./components/layout/Footer.js";

const App = () => {
  const app = document.createElement("div");
  app.className = "min-h-screen flex flex-col bg-background text-text";

  const main = document.createElement("main");
  main.id = "page-view";

  const layout = document.createElement("div");
  layout.className = "mx-auto flex min-h-screen w-full max-w-7xl flex-col";

  const isHome = () => window.location.pathname === "/";

  const render = () => {
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
  renderRoute(main);

  return app;
};

export default App;

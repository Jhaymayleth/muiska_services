import { renderRoute, navigateTo } from "./router/router.js";
import Navbar from "./components/layout/Navbar.js";
import Footer from "./components/layout/Footer.js";

const App = () => {
  const app = document.createElement("div");
  app.className = "min-h-screen flex flex-col bg-background text-text";

  const main = document.createElement("main");
  main.id = "page-view";

  const layout = document.createElement("div");
  layout.className = "mx-auto flex min-h-screen w-full max-w-7xl flex-col";

  const render = () => {
    layout.innerHTML = "";
    main.className = "flex-1 px-4 py-8 md:px-8";
    layout.appendChild(Navbar());
    layout.appendChild(main);
    layout.appendChild(Footer());
    renderRoute(main);
  };

  layout.appendChild(Navbar());
  layout.appendChild(main);
  layout.appendChild(Footer());
  app.appendChild(layout);

  window.addEventListener("popstate", render);
  render();

  return app;
};

export default App;

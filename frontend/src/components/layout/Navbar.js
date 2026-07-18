import { isAdmin, isAuthenticated, getUser, logout } from "../../utils/auth.js";

const Navbar = () => {
  const nav = document.createElement("nav");
  nav.className =
    "border-b border-border bg-background/90 px-4 py-4 backdrop-blur md:px-8";

  const authenticated = isAuthenticated();
  const user = getUser();

  nav.innerHTML = `
    <div class="flex items-center justify-between">
      <a href="/" class="text-xl font-semibold text-primary">MUISKA</a>
      <div class="flex items-center gap-3 text-sm">
        <a href="/explorar" class="rounded px-3 py-2 hover:bg-muted">Explorar</a>
        ${authenticated ? `
          <a href="/crear-publicacion" class="rounded px-3 py-2 hover:bg-muted">Crear</a>
          <a href="/dashboard" class="rounded px-3 py-2 hover:bg-muted">Dashboard</a>
          ${isAdmin() ? '<a href="/admin" class="rounded px-3 py-2 hover:bg-muted">Admin</a>' : ""}
          <div class="flex items-center gap-3 border-l border-border pl-3">
            <span class="text-text/70">${user?.name || "Usuario"}</span>
            <button id="btn-logout" class="rounded px-3 py-2 text-red-600 hover:bg-red-50">Salir</button>
          </div>
        ` : `
          <a href="/login" class="rounded px-3 py-2 hover:bg-muted">Iniciar sesión</a>
          <a href="/registro" class="rounded px-3 py-2 bg-primary text-white hover:bg-primary-hover">Registrarse</a>
        `}
      </div>
    </div>
  `;

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const path = link.getAttribute("href");
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });

  const logoutBtn = nav.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }

  return nav;
};

export default Navbar;

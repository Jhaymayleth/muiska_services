const Navbar = () => {
  const nav = document.createElement("nav");
  nav.className =
    "border-b border-border bg-background/90 px-4 py-4 backdrop-blur md:px-8";

  nav.innerHTML = `
    <div class="flex items-center justify-between">
      <a href="/" class="text-xl font-semibold text-primary">MUISKA</a>
      <div class="flex gap-3 text-sm">
        <a href="/explorar" class="rounded px-3 py-2 hover:bg-muted">Explorar</a>
        <a href="/login" class="rounded px-3 py-2 hover:bg-muted">Login</a>
        <a href="/registro" class="rounded px-3 py-2 hover:bg-muted">Registro</a>
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

  return nav;
};

export default Navbar;

const NotFoundPage = () => {
  const section = document.createElement("section");
  section.className =
    "space-y-4 rounded-2xl border border-border bg-white p-8 shadow-sm";
  section.innerHTML = `
    <h1 class="text-3xl font-semibold text-primary">404</h1>
    <p class="text-sm text-text/70">Página no encontrada. Será implementada posteriormente.</p>
  `;
  return section;
};

export default NotFoundPage;

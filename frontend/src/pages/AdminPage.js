// AdminPage - Panel de administración (placeholder)
const AdminPage = () => {
  const section = document.createElement("section");
  section.className = "space-y-4 rounded-2xl border border-border bg-white p-8 shadow-sm";
  section.innerHTML = `
    <h1 class="text-3xl font-semibold text-primary">Panel Admin</h1>
    <p class="text-sm text-text/70">En construcción - Aquí iría la gestión de usuarios, publicaciones y categorías.</p>
  `;
  return section;
};

export default AdminPage;
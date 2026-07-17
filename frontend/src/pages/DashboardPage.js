import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { getUser } from "../utils/auth.js";

const DashboardPage = () => {
  const section = document.createElement("section");
  section.className = "space-y-6";
  section.innerHTML = `
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-3xl font-semibold text-primary">Mis publicaciones</h1>
      <a href="/crear-publicacion" id="new-publication" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">
        Nueva publicación
      </a>
    </div>
    <div id="dashboard-list" class="space-y-4"></div>
  `;

  const list = section.querySelector("#dashboard-list");
  const user = getUser();

  section.querySelector("#new-publication").addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo("/crear-publicacion");
  });

  const renderList = async () => {
    list.innerHTML = '<p class="text-sm text-text/70">Cargando...</p>';

    try {
      const response = await api.getPublications({ user_id: user.id });
      const publications = response.data || [];

      if (publications.length === 0) {
        list.innerHTML = `
          <div class="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <h2 class="text-lg font-semibold">No tienes publicaciones activas</h2>
            <p class="mt-2 text-sm text-text/70">Crea tu primera publicación para empezar.</p>
          </div>`;
        return;
      }

      list.replaceChildren();
      publications.forEach((publication) => {
        const card = document.createElement("div");
        card.className = "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white p-4";

        const details = document.createElement("div");
        const title = document.createElement("h2");
        title.className = "font-semibold";
        title.textContent = publication.title || "Sin título";
        const metadata = document.createElement("p");
        metadata.className = "text-sm text-text/70";
        metadata.textContent = `$${parseFloat(publication.price || 0).toFixed(2)}${publication.category ? ` · ${publication.category}` : ""}`;
        details.append(title, metadata);

        const actions = document.createElement("div");
        actions.className = "flex gap-2";
        const editButton = document.createElement("button");
        editButton.className = "rounded bg-accent/10 px-3 py-1 text-sm text-accent transition hover:bg-accent/20";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => navigateTo(`/editar-publicacion/${publication.id}`));

        const deleteButton = document.createElement("button");
        deleteButton.className = "rounded bg-red-50 px-3 py-1 text-sm text-red-600 transition hover:bg-red-100";
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", async () => {
          if (!confirm("¿Eliminar esta publicación?")) return;
          try {
            await api.deletePublication(publication.id);
            await renderList();
          } catch (error) {
            alert(error.message);
          }
        });

        actions.append(editButton, deleteButton);
        card.append(details, actions);
        list.appendChild(card);
      });
    } catch (error) {
      list.innerHTML = `<p class="text-sm text-red-600">${error.message || "Error al cargar tus publicaciones"}</p>`;
    }
  };

  renderList();
  return section;
};

export default DashboardPage;

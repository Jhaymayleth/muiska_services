import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";

const DashboardPage = () => {
  const section = document.createElement("section");
  section.className = "space-y-6";

  const renderList = () => {
    list.innerHTML = '<p class="text-sm text-text/70">Cargando...</p>';
    api.getMyPublications().then((pubs) => {
      if (pubs.length === 0) {
        list.innerHTML = `
          <div class="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <h3 class="text-lg font-semibold">No hay publicaciones</h3>
            <p class="mt-2 text-sm text-text/70">Crea tu primera publicación para empezar.</p>
          </div>`;
        return;
      }
      list.innerHTML = "";
      pubs.forEach((pub) => {
        const card = document.createElement("div");
        card.className =
          "flex items-center justify-between rounded-xl border border-border bg-white p-4";
        card.innerHTML = `
          <div>
            <h3 class="font-semibold">${pub.title}</h3>
            <p class="text-sm text-text/70">$${parseFloat(pub.price).toFixed(2)}${pub.category ? ` · ${pub.category}` : ""}</p>
          </div>
          <div class="flex gap-2">
            <button data-id="${pub.id}" class="edit-btn rounded bg-accent/10 px-3 py-1 text-sm text-accent transition hover:bg-accent/20">Editar</button>
            <button data-id="${pub.id}" class="delete-btn rounded bg-red-50 px-3 py-1 text-sm text-red-600 transition hover:bg-red-100">Eliminar</button>
          </div>
        `;
        card.querySelector(".edit-btn").addEventListener("click", () => {
          navigateTo(`/editar-publicacion/${pub.id}`);
        });
        card
          .querySelector(".delete-btn")
          .addEventListener("click", async () => {
            if (confirm("¿Eliminar esta publicación?")) {
              try {
                await api.deletePublication(pub.id);
                renderList();
              } catch (err) {
                alert(err.message);
              }
            }
          });
        list.appendChild(card);
      });
    });
  };

  const stats = section.querySelector("#dashboard-stats");

  stats.innerHTML = `
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm text-text/70">Mis publicaciones</p>
      <h2 class="text-2xl font-bold">${pubs.length}</h2>
    </div>
  </div>
  `;

  section.innerHTML = `
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-semibold text-primary">Dashboard</h1>
      <a href="/crear-publicacion" id="btn-new-publication" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">
        Nueva publicación
      </a>
    </div>
    <div id="dashboard-stats" class="rounded-xl border border-border bg-white p-4"></div>
    <div id="dashboard-list" class="space-y-4"></div>
  `;

  section
    .querySelector("#btn-new-publication")
    .addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo("/crear-publicacion");
    });

  const list = section.querySelector("#dashboard-list");
  renderList();

  return section;
};

export default DashboardPage;

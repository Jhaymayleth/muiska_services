import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";
import { getUser, sessionStore } from "../../utils/auth.js";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Sin fecha";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const DashboardPage = () => {
  const section = document.createElement("section");
  section.className = "space-y-6";

  const user = getUser() || {};

  const renderStats = (pubs) => {
    const total = pubs.length;
    const active = pubs.filter((p) => p.status === "active").length;
    const sold = pubs.filter((p) => p.status === "sold").length;

    stats.innerHTML = `
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p class="text-sm text-text/60">Total publicaciones</p>
          <p class="mt-2 font-display text-3xl font-bold text-primary">${total}</p>
        </article>
        <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p class="text-sm text-text/60">Activas</p>
          <p class="mt-2 font-display text-3xl font-bold text-accent">${active}</p>
        </article>
        <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p class="text-sm text-text/60">Vendidas/Inactivas</p>
          <p class="mt-2 font-display text-3xl font-bold text-text">${sold}</p>
        </article>
      </div>
    `;
  };

  const renderList = async () => {
    list.innerHTML = '<p class="text-sm text-text/70">Cargando...</p>';

    try {
      const pubs = await api.getMyPublications();
      renderStats(pubs);

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
        const statusBadge =
          pub.status === "active"
            ? '<span class="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">Activa</span>'
            : '<span class="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-text/70">Inactiva</span>';

        card.innerHTML = `
          <div>
            <h3 class="font-semibold">${pub.title}</h3>
            <p class="text-sm text-text/70">$${parseFloat(pub.price).toFixed(2)}${pub.category ? ` · ${pub.category}` : ""} · ${statusBadge}</p>
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
    } catch (err) {
      list.innerHTML = `<p class="text-sm text-red-600">${err.message || "No se pudieron cargar las publicaciones."}</p>`;
    }
  };

  section.innerHTML = `
    <div class="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-background text-2xl font-bold">${getInitials(user.name)}</div>
          <div>
            <h2 class="font-display text-2xl font-bold text-text">${user.name || "Usuario"}</h2>
            <p class="text-sm text-text/60">${user.email}</p>
            <p class="text-xs text-text/50">Rol: ${user.role || "user"} · Miembro desde ${formatDate(user.created_at)}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <a href="/crear-publicacion" id="btn-new-pub" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">Nueva publicación</a>
          <a href="/perfil" id="btn-profile" class="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text transition hover:bg-background">Ver perfil</a>
          <a href="/explorar" id="btn-explore" class="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text transition hover:bg-background">Explorar</a>
          ${user.role === "admin" ? '<a href="/admin" id="btn-admin" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">Panel admin</a>' : ""}
        </div>
      </div>
    </div>

    <div id="dashboard-stats" class="rounded-xl border border-border bg-white p-4"></div>

    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-text">Mis publicaciones</h2>
      </div>
      <div id="dashboard-list" class="space-y-4"></div>
    </section>
  `;

  section.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    });
  });

  const stats = section.querySelector("#dashboard-stats");
  const list = section.querySelector("#dashboard-list");
  renderList();

  return section;
};

export default DashboardPage;
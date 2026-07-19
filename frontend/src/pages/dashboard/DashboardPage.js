import { navigateTo } from "../../router/router.js";
import { getUser, sessionStore } from "../../utils/auth.js";
import { getFavorites } from "../../services/publication.service.js";

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

  // Leer URL para determinar qué tab mostrar
  const path = window.location.pathname;
  let activeTab = path === "/dashboard/favoritos" ? "favorites" : "publications";

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

  const renderPubList = async () => {
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
                renderPubList();
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

  const renderFavList = async () => {
    favList.innerHTML = '<p class="text-sm text-text/70">Cargando...</p>';
    favStats.innerHTML = "";

    try {
      const result = await getFavorites({ page: 1, limit: 12 });
      const favs = result.data || [];

      if (favs.length === 0) {
        favList.innerHTML = `
          <div class="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <svg class="mx-auto h-12 w-12 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <h3 class="mt-4 text-lg font-semibold">No tienes favoritos</h3>
            <p class="mt-2 text-sm text-text/70">Explora y guarda tus publicaciones favoritas.</p>
            <a href="/explorar" class="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">Explorar</a>
          </div>`;
        return;
      }

      // Stats
      favStats.innerHTML = `
        <div class="grid gap-4 sm:grid-cols-3 mb-6">
          <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p class="text-sm text-text/60">Total favoritos</p>
            <p class="mt-2 font-display text-3xl font-bold text-primary">${favs.length}</p>
          </article>
          <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p class="text-sm text-text/60">Activas</p>
            <p class="mt-2 font-display text-3xl font-bold text-accent">${favs.filter((p) => p.status === "active").length}</p>
          </article>
          <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p class="text-sm text-text/60">Vendidas/Inactivas</p>
            <p class="mt-2 font-display text-3xl font-bold text-text">${favs.filter((p) => p.status === "sold" || p.status === "inactive").length}</p>
          </article>
        </div>
      `;

      favList.innerHTML = "";
      favs.forEach((pub) => {
        const card = document.createElement("div");
        card.className =
          "flex items-center justify-between rounded-xl border border-border bg-white p-4";
        const statusBadge =
          pub.status === "active"
            ? '<span class="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">Activa</span>'
            : '<span class="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-text/70">Inactiva</span>';

        card.innerHTML = `
          <div class="flex items-center gap-4">
            ${pub.images && pub.images.length > 0 ? `<img src="${pub.images[0]}" alt="${pub.title}" class="h-20 w-20 rounded-lg object-cover">` : '<div class="h-20 w-20 rounded-lg bg-muted flex items-center justify-center"><svg class="w-8 h-8 text-text/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>'}
            <div>
              <h3 class="font-semibold">${pub.title}</h3>
              <p class="text-sm text-text/70">$${parseFloat(pub.price).toFixed(2)}${pub.category ? ` · ${pub.category}` : ""} · ${statusBadge}</p>
              <p class="text-xs text-text/50">Por: ${pub.user_name || "Usuario"}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <a href="/publicacion/${pub.id}" class="rounded bg-accent/10 px-3 py-1 text-sm text-accent transition hover:bg-accent/20">Ver</a>
            <button data-id="${pub.id}" class="unfav-btn rounded bg-red-50 px-3 py-1 text-sm text-red-600 transition hover:bg-red-100">Quitar</button>
          </div>
        `;
        card.querySelector(".unfav-btn").addEventListener("click", async () => {
          if (confirm("¿Quitar de favoritos?")) {
            try {
              await api.request(`/favorites/${pub.id}/toggle`, { method: "POST" });
              renderFavList();
            } catch (err) {
              alert(err.message);
            }
          }
        });
        favList.appendChild(card);
      });
    } catch (err) {
      favList.innerHTML = `<p class="text-sm text-red-600">${err.message || "No se pudieron cargar los favoritos."}</p>`;
    }
  };

  const switchTab = (tab) => {
    activeTab = tab;
    if (tab === "publications") {
      tabPublications.classList.add("bg-primary", "text-white");
      tabPublications.classList.remove("text-text/70", "hover:bg-muted");
      tabFavorites.classList.remove("bg-primary", "text-white");
      tabFavorites.classList.add("text-text/70", "hover:bg-muted");
      publicationsSection.classList.remove("hidden");
      favoritesSection.classList.add("hidden");
      renderPubList();
    } else {
      tabFavorites.classList.add("bg-primary", "text-white");
      tabFavorites.classList.remove("text-text/70", "hover:bg-muted");
      tabPublications.classList.remove("bg-primary", "text-white");
      tabPublications.classList.add("text-text/70", "hover:bg-muted");
      favoritesSection.classList.remove("hidden");
      publicationsSection.classList.add("hidden");
      renderFavList();
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

    <!-- Tabs -->
    <div class="rounded-2xl border border-border bg-white overflow-hidden">
      <nav class="flex border-b border-border" aria-label="Secciones del dashboard">
        <button id="tab-publications" class="tab-btn px-6 py-3 text-sm font-medium rounded-t-lg transition bg-primary text-white" data-tab="publications">Mis publicaciones</button>
        <button id="tab-favorites" class="tab-btn px-6 py-3 text-sm font-medium rounded-t-lg transition text-text/70 hover:bg-muted" data-tab="favorites">Favoritos</button>
      </nav>

      <div id="publications-section" class="p-5">
        <div id="dashboard-stats" class="rounded-xl border border-border bg-white p-4"></div>
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-text">Mis publicaciones</h2>
          </div>
          <div id="dashboard-list" class="space-y-4"></div>
        </section>
      </div>

      <div id="favorites-section" class="p-5 hidden">
        <div id="favorites-stats"></div>
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-text">Mis favoritos</h2>
          </div>
          <div id="favorites-list" class="space-y-4"></div>
        </section>
      </div>
    </div>
  `;

  section.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    });
  });

  const stats = section.querySelector("#dashboard-stats");
  const list = section.querySelector("#dashboard-list");
  const favList = section.querySelector("#favorites-list");
  const favStats = section.querySelector("#favorites-stats");
  const tabPublications = section.querySelector("#tab-publications");
  const tabFavorites = section.querySelector("#tab-favorites");
  const publicationsSection = section.querySelector("#publications-section");
  const favoritesSection = section.querySelector("#favorites-section");

  tabPublications.addEventListener("click", () => switchTab("publications"));
  tabFavorites.addEventListener("click", () => switchTab("favorites"));

  // Initial load basado en la URL
  if (activeTab === "favorites") {
    switchTab("favorites");
  } else {
    renderPubList();
  }

  return section;
};

export default DashboardPage;
import { navigateTo } from "../../router/router.js";
import { api } from "../../services/api.js";
import { getUser, sessionStore } from "../../utils/auth.js";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', '"')
    .replaceAll("'", "&#039;");

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Sin fecha";

const statusBadge = (status) => {
  const config = {
    active: { label: "Activa", class: "bg-accent/10 text-accent" },
    sold: { label: "Vendida", class: "bg-primary/10 text-primary" },
    inactive: { label: "Inactiva", class: "bg-muted text-text/70" },
  };
  const c = config[status] || { label: status, class: "bg-muted text-text" };
  return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${c.class}">${c.label}</span>`;
};

const AdminPage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto w-full max-w-6xl space-y-6";

  const user = getUser() || {};
  let activeTab = "dashboard";

  const renderTabs = () => `
    <nav class="flex gap-1 border-b border-border mb-6" aria-label="Secciones del panel admin">
      <button data-tab="dashboard" class="tab-btn px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === "dashboard" ? "bg-primary text-white" : "text-text/70 hover:bg-muted"}">Resumen</button>
      <button data-tab="publications" class="tab-btn px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === "publications" ? "bg-primary text-white" : "text-text/70 hover:bg-muted"}">Publicaciones</button>
      <button data-tab="categories" class="tab-btn px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === "categories" ? "bg-primary text-white" : "text-text/70 hover:bg-muted"}">Categorías</button>
      <button data-tab="users" class="tab-btn px-4 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === "users" ? "bg-primary text-white" : "text-text/70 hover:bg-muted"}">Usuarios</button>
    </nav>
  `;

  const renderDashboard = () => `
    <div id="admin-error" class="hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6"></div>

    <section aria-label="Resumen" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-text/60">Publicaciones activas</p>
            <p id="active-count" class="mt-2 font-display text-3xl font-bold text-primary">—</p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl text-primary" aria-hidden="true">▤</span>
        </div>
      </article>
      <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-text/60">Categorías</p>
            <p id="category-count" class="mt-2 font-display text-3xl font-bold text-accent">—</p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-xl text-accent" aria-hidden="true">◇</span>
        </div>
      </article>
      <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-text/60">Total publicaciones</p>
            <p id="total-count" class="mt-2 font-display text-3xl font-bold text-text">—</p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl text-text" aria-hidden="true">◷</span>
        </div>
      </article>
      <article class="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm text-text/60">Servicio</p>
            <p id="service-status" class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-text/40">Cargando</p>
          </div>
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl text-text" aria-hidden="true">●</span>
        </div>
      </article>
    </section>

    <div class="grid gap-6 lg:grid-cols-3">
      <section class="rounded-2xl border border-border bg-white p-5 shadow-sm lg:col-span-2 sm:p-6">
        <div class="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-text">Publicaciones recientes</h2>
            <p class="mt-1 text-sm text-text/60">Las 5 publicaciones más recientes.</p>
          </div>
          <button id="view-listings" class="shrink-0 text-sm font-semibold text-primary transition hover:text-primary-hover">Ver todas →</button>
        </div>
        <div id="recent-publications" class="overflow-x-auto">
          <p class="py-8 text-center text-sm text-text/60">Cargando publicaciones…</p>
        </div>
      </section>

      <aside class="space-y-6">
        <section class="rounded-2xl border border-border bg-muted p-5 sm:p-6">
          <p class="text-sm font-medium text-text/60">Acciones rápidas</p>
          <h2 class="mt-1 font-display text-2xl font-bold text-text">Gestiona la comunidad</h2>
          <div class="mt-5 space-y-3">
            <button id="create-listing" class="flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-primary-hover">
              Crear publicación <span aria-hidden="true">→</span>
            </button>
            <button id="browse-listings" class="flex w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-semibold text-text transition hover:bg-background">
              Explorar publicaciones <span class="text-accent" aria-hidden="true">↗</span>
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-text/60">Categorías registradas</p>
              <p class="mt-1 text-xs text-text/50">Disponibles para clasificar publicaciones.</p>
            </div>
            <span class="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent" id="category-badge">—</span>
          </div>
          <div id="category-list" class="mt-4 flex flex-wrap gap-2">
            <span class="text-sm text-text/60">Cargando categorías…</span>
          </div>
        </section>
      </aside>
    </div>
  `;

  const renderPublicationsTab = () => `
    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div class="p-5 border-b border-border">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 class="font-display text-2xl font-bold text-text">Gestión de publicaciones</h2>
            <p class="mt-1 text-sm text-text/60">Lista, filtra y elimina cualquier publicación.</p>
          </div>
          <div class="flex flex-wrap gap-3 w-full sm:w-auto">
            <select id="pub-status-filter" class="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="sold">Vendidas</option>
              <option value="inactive">Inactivas</option>
            </select>
            <input type="search" id="pub-search" placeholder="Buscar título..." class="min-w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        </div>
      </div>
      <div id="publications-container" class="overflow-x-auto">
        <p class="py-8 text-center text-sm text-text/60">Cargando publicaciones…</p>
      </div>
      <div id="publications-pagination" class="p-5 border-t border-border flex justify-center"></div>
    </div>
  `;

  const renderCategoriesTab = () => `
    <div class="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div class="p-5 border-b border-border flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 class="font-display text-2xl font-bold text-text">Gestión de categorías</h2>
          <p class="mt-1 text-sm text-text/60">Crea, edita y elimina categorías.</p>
        </div>
        <button id="btn-new-category" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover shrink-0">Nueva categoría</button>
      </div>
      <div id="categories-container" class="p-5">
        <p class="py-8 text-center text-sm text-text/60">Cargando categorías…</p>
      </div>
    </div>

    <!-- Modal nueva/editar categoría -->
    <div id="category-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/50">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div class="p-5 border-b border-border flex items-center justify-between">
          <h3 id="category-modal-title" class="font-display text-xl font-bold">Nueva categoría</h3>
          <button id="close-category-modal" class="text-text/50 hover:text-text text-xl">✕</button>
        </div>
        <form id="category-form" class="p-5 space-y-4">
          <input type="hidden" id="category-id" />
          <div>
            <label for="category-name" class="block text-sm font-medium text-text mb-1">Nombre *</label>
            <input type="text" id="category-name" required class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label for="category-description" class="block text-sm font-medium text-text mb-1">Descripción</label>
            <textarea id="category-description" rows="3" class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="cancel-category" class="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-background">Cancelar</button>
            <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const renderUsersTab = () => `
    <section class="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-medium text-accent">Administración de acceso</p>
          <h2 class="mt-1 font-display text-2xl font-bold text-text">Gestión de usuarios</h2>
          <p class="mt-1 text-sm text-text/60">Cambia roles, suspende el acceso o elimina cuentas y sus publicaciones.</p>
        </div>
        <form id="user-search-form" class="flex w-full gap-2 md:max-w-sm">
          <input id="user-search" type="search" placeholder="Buscar nombre o correo" class="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover">Buscar</button>
        </form>
      </div>
      <div id="user-management-message" class="mt-4 hidden rounded-lg px-4 py-3 text-sm"></div>
      <div id="admin-users" class="mt-5 overflow-x-auto">
        <p class="py-8 text-center text-sm text-text/60">Cargando usuarios…</p>
      </div>
    </section>
  `;

  section.innerHTML = `
    <header class="overflow-hidden rounded-2xl bg-primary px-6 py-7 text-background shadow-sm sm:px-8">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="mb-2 text-sm font-medium text-background/70">Administración de MUISKA</p>
          <h1 class="font-display text-4xl font-bold leading-tight">Panel de control</h1>
          <p class="mt-2 text-sm text-background/75">Hola, ${escapeHtml(user.name || "Administrador")}. Aquí tienes el estado de la comunidad.</p>
        </div>
        <button id="refresh-dashboard" class="inline-flex items-center justify-center gap-2 rounded-lg border border-background/30 bg-background/10 px-4 py-2 text-sm font-semibold transition hover:bg-background/20">
          <span aria-hidden="true">↻</span> Actualizar datos
        </button>
      </div>
    </header>

    <div id="tab-content">${renderTabs() + renderDashboard()}</div>
  `;

  const tabContent = section.querySelector("#tab-content");

  const switchTab = (tab) => {
    activeTab = tab;
    if (tab === "dashboard") {
      tabContent.innerHTML = renderTabs() + renderDashboard();
      attachDashboardListeners();
      loadDashboard();
    } else if (tab === "publications") {
      tabContent.innerHTML = renderTabs() + renderPublicationsTab();
      attachPublicationsListeners();
      loadPublications(1);
    } else if (tab === "categories") {
      tabContent.innerHTML = renderTabs() + renderCategoriesTab();
      attachCategoriesListeners();
      loadCategories();
    } else if (tab === "users") {
      tabContent.innerHTML = renderTabs() + renderUsersTab();
      attachUsersListeners();
      loadUsers();
    }
  };

  tabContent.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (btn) switchTab(btn.dataset.tab);
  });

  // --- Dashboard ---
  const attachDashboardListeners = () => {
    const activeCount = section.querySelector("#active-count");
    const categoryCount = section.querySelector("#category-count");
    const totalCount = section.querySelector("#total-count");
    const serviceStatus = section.querySelector("#service-status");
    const categoryBadge = section.querySelector("#category-badge");
    const categoryList = section.querySelector("#category-list");
    const recentPublications = section.querySelector("#recent-publications");
    const errorBox = section.querySelector("#admin-error");

    const renderPublications = (publications) => {
      if (publications.length === 0) {
        recentPublications.innerHTML = '<p class="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text/60">No hay publicaciones activas todavía.</p>';
        return;
      }
      recentPublications.innerHTML = `
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead class="border-b border-border text-xs uppercase tracking-wide text-text/50">
            <tr>
              <th class="pb-3 font-medium">Publicación</th>
              <th class="pb-3 font-medium">Categoría</th>
              <th class="pb-3 font-medium">Precio</th>
              <th class="pb-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${publications
              .map(
                (p) => `
                  <tr class="transition hover:bg-background/70">
                    <td class="py-4 pr-4 font-semibold text-text">${escapeHtml(p.title || "Sin título")}</td>
                    <td class="py-4 pr-4"><span class="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-text/70">${escapeHtml(p.category || "Sin categoría")}</span></td>
                    <td class="py-4 pr-4 font-medium text-accent">$${Number(p.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="py-4 text-text/60">${formatDate(p.created_at)}</td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      `;
    };

    window.loadDashboard = async () => {
      errorBox.classList.add("hidden");
      serviceStatus.innerHTML = '<span class="h-2 w-2 rounded-full bg-text/30"></span>Cargando';

      try {
        const [pubResponse, categories] = await Promise.all([
          api.getPublications({ status: "active", page: 1, limit: 5 }),
          api.getCategories(),
        ]);
        const publications = pubResponse.data || [];
        const total = pubResponse.pagination?.total || publications.length;

        activeCount.textContent = total.toLocaleString("es-CO");
        categoryCount.textContent = categories.length.toLocaleString("es-CO");
        totalCount.textContent = total.toLocaleString("es-CO");
        categoryBadge.textContent = categories.length;
        serviceStatus.innerHTML = '<span class="h-2 w-2 rounded-full bg-accent"></span>Operativo';
        serviceStatus.className = "mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent";

        categoryList.innerHTML = categories.length
          ? categories
              .map(
                (c) =>
                  `<span class="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-text/70">${escapeHtml(c.name)}</span>`,
              )
              .join("")
          : '<span class="text-sm text-text/60">No hay categorías registradas.</span>';
        renderPublications(publications);
      } catch (error) {
        serviceStatus.innerHTML = '<span class="h-2 w-2 rounded-full bg-red-500"></span>No disponible';
        serviceStatus.className = "mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-600";
        errorBox.textContent = error.message || "No se pudieron cargar los datos del panel.";
        errorBox.classList.remove("hidden");
        recentPublications.innerHTML = '<p class="rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">No se pudieron cargar las publicaciones.</p>';
      }
    };

    section.querySelector("#refresh-dashboard").addEventListener("click", loadDashboard);
    section.querySelector("#view-listings")?.addEventListener("click", () => navigateTo("/explorar"));
    section.querySelector("#create-listing")?.addEventListener("click", () => navigateTo("/crear-publicacion"));
    section.querySelector("#browse-listings")?.addEventListener("click", () => navigateTo("/explorar"));
  };

  // --- Publications Tab ---
  let pubCurrentPage = 1;
  let pubCurrentStatus = "";
  let pubCurrentSearch = "";

  const attachPublicationsListeners = () => {
    const container = section.querySelector("#publications-container");
    const pagination = section.querySelector("#publications-pagination");
    const statusFilter = section.querySelector("#pub-status-filter");
    const searchInput = section.querySelector("#pub-search");

    const render = (pubs, paginationData) => {
      if (pubs.length === 0) {
        container.innerHTML = '<p class="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text/60">No hay publicaciones.</p>';
        pagination.innerHTML = "";
        return;
      }
      container.innerHTML = `
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="border-b border-border text-xs uppercase tracking-wide text-text/50">
            <tr>
              <th class="pb-3 font-medium">Publicación</th>
              <th class="pb-3 font-medium">Categoría</th>
              <th class="pb-3 font-medium">Estado</th>
              <th class="pb-3 font-medium">Precio</th>
              <th class="pb-3 font-medium">Usuario</th>
              <th class="pb-3 font-medium">Fecha</th>
              <th class="pb-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${pubs
              .map(
                (p) => `
                  <tr class="transition hover:bg-background/70">
                    <td class="py-4 pr-4 font-semibold text-text">${escapeHtml(p.title || "Sin título")}</td>
                    <td class="py-4 pr-4">${escapeHtml(p.category || "—")}</td>
                    <td class="py-4 pr-4">${statusBadge(p.status)}</td>
                    <td class="py-4 pr-4 font-medium text-accent">$${Number(p.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="py-4 pr-4 text-text/70">${escapeHtml(p.user_name || p.user_id || "—")}</td>
                    <td class="py-4 text-text/60">${formatDate(p.created_at)}</td>
                    <td class="py-4 text-right">
                      <button data-action="delete" data-id="${p.id}" class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">Eliminar</button>
                    </td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      `;

      // Pagination
      if (paginationData && paginationData.totalPages > 1) {
        let html = '<nav class="flex items-center justify-center gap-2" aria-label="Paginación">';
        if (paginationData.page > 1) {
          html += `<button data-page="${paginationData.page - 1}" class="pagination-btn rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition">Anterior</button>`;
        }
        const start = Math.max(1, paginationData.page - 2);
        const end = Math.min(paginationData.totalPages, paginationData.page + 2);
        for (let i = start; i <= end; i++) {
          html += `<button data-page="${i}" class="pagination-btn w-8 h-8 rounded-lg text-sm font-medium transition ${i === paginationData.page ? "bg-primary text-white" : "hover:bg-muted"}">${i}</button>`;
        }
        if (paginationData.page < paginationData.totalPages) {
          html += `<button data-page="${paginationData.page + 1}" class="pagination-btn rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition">Siguiente</button>`;
        }
        html += "</nav>";
        pagination.innerHTML = html;
      } else {
        pagination.innerHTML = "";
      }
    };

    window.loadPublications = async (page = 1) => {
      pubCurrentPage = page;
      container.innerHTML = '<p class="py-8 text-center text-sm text-text/60">Cargando…</p>';
      try {
        const params = { page, limit: 20 };
        if (pubCurrentStatus) params.status = pubCurrentStatus;
        if (pubCurrentSearch) params.search = pubCurrentSearch;
        const res = await api.getAdminPublications(params);
        render(res.data || [], res.pagination);
      } catch (err) {
        container.innerHTML = `<p class="rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">${err.message}</p>`;
      }
    };

    statusFilter.addEventListener("change", () => {
      pubCurrentStatus = statusFilter.value;
      loadPublications(1);
    });

    searchInput.addEventListener("input", () => {
      pubCurrentSearch = searchInput.value.trim();
      loadPublications(1);
    });

    container.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === "delete") {
        if (!confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
        try {
          await api.deleteAdminPublication(id);
          loadPublications(pubCurrentPage);
        } catch (err) {
          alert(err.message);
        }
      }
    });

    pagination.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-page]");
      if (btn) loadPublications(parseInt(btn.dataset.page, 10));
    });
  };

  // --- Categories Tab ---
  const attachCategoriesListeners = () => {
    const container = section.querySelector("#categories-container");
    const modal = section.querySelector("#category-modal");
    const form = section.querySelector("#category-form");
    const titleEl = section.querySelector("#category-modal-title");
    const idInput = section.querySelector("#category-id");
    const nameInput = section.querySelector("#category-name");
    const descInput = section.querySelector("#category-description");

    const openModal = (category = null) => {
      form.reset();
      idInput.value = "";
      if (category) {
        titleEl.textContent = "Editar categoría";
        idInput.value = category.id;
        nameInput.value = category.name;
        descInput.value = category.description || "";
      } else {
        titleEl.textContent = "Nueva categoría";
      }
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      nameInput.focus();
    };

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    };

    const render = (categories) => {
      if (categories.length === 0) {
        container.innerHTML = '<p class="py-8 text-center text-sm text-text/60">No hay categorías.</p>';
        return;
      }
      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-border text-xs uppercase tracking-wide text-text/50">
              <tr>
                <th class="pb-3 font-medium">Nombre</th>
                <th class="pb-3 font-medium">Descripción</th>
                <th class="pb-3 font-medium">Fecha</th>
                <th class="pb-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              ${categories
                .map(
                  (c) => `
                    <tr class="transition hover:bg-background/70">
                      <td class="py-4 pr-4 font-semibold text-text">${escapeHtml(c.name)}</td>
                      <td class="py-4 pr-4 text-text/70">${escapeHtml(c.description || "—")}</td>
                      <td class="py-4 pr-4 text-text/60">${formatDate(c.created_at)}</td>
                      <td class="py-4 text-right">
                        <button data-action="edit" data-id="${c.id}" class="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text hover:bg-background transition mr-2">Editar</button>
                        <button data-action="delete" data-id="${c.id}" class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition">Eliminar</button>
                      </td>
                    </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    };

    window.loadCategories = async () => {
      container.innerHTML = '<p class="py-8 text-center text-sm text-text/60">Cargando…</p>';
      try {
        const cats = await api.getCategories();
        render(cats);
      } catch (err) {
        container.innerHTML = `<p class="rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">${err.message}</p>`;
      }
    };

    section.querySelector("#btn-new-category").addEventListener("click", () => openModal());
    section.querySelector("#close-category-modal").addEventListener("click", closeModal);
    section.querySelector("#cancel-category").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = idInput.value;
      const data = { name: nameInput.value.trim(), description: descInput.value.trim() || null };
      try {
        if (id) {
          await api.updateCategory(id, data);
        } else {
          await api.createCategory(data);
        }
        closeModal();
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    });

    container.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const { action, id } = btn.dataset;
      if (action === "edit") {
        try {
          const cat = await api.getCategory(id);
          openModal(cat);
        } catch (err) {
          alert(err.message);
        }
      }
      if (action === "delete") {
        if (!confirm("¿Eliminar esta categoría? Las publicaciones que la usan quedarán sin categoría.")) return;
        try {
          await api.deleteCategory(id);
          loadCategories();
        } catch (err) {
          alert(err.message);
        }
      }
    });
  };

  // --- Users Tab ---
  const attachUsersListeners = () => {
    const container = section.querySelector("#admin-users");
    const searchInput = section.querySelector("#user-search");
    const form = section.querySelector("#user-search-form");
    const msg = section.querySelector("#user-management-message");

    const showMsg = (text, type = "success") => {
      msg.textContent = text;
      msg.className = `mt-4 rounded-lg px-4 py-3 text-sm ${type === "success" ? "bg-accent/10 text-accent" : "bg-red-50 text-red-700"}`;
    };

    const render = (users) => {
      if (users.length === 0) {
        container.innerHTML = '<p class="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text/60">No se encontraron usuarios.</p>';
        return;
      }
      container.innerHTML = `
        <table class="w-full min-w-[840px] text-left text-sm">
          <thead class="border-b border-border text-xs uppercase tracking-wide text-text/50">
            <tr>
              <th class="pb-3 font-medium">Usuario</th>
              <th class="pb-3 font-medium">Rol</th>
              <th class="pb-3 font-medium">Estado</th>
              <th class="pb-3 font-medium">Publicaciones</th>
              <th class="pb-3 font-medium">Registro</th>
              <th class="pb-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${users
              .map((u) => {
                const isMe = u.id === user.id;
                return `
                  <tr class="align-middle transition hover:bg-background/70">
                    <td class="py-4 pr-4">
                      <p class="font-semibold text-text">${escapeHtml(u.name || "Sin nombre")}${isMe ? ' <span class="ml-1 text-xs font-medium text-text/50">(tú)</span>' : ""}</p>
                      <p class="mt-0.5 text-xs text-text/60">${escapeHtml(u.email)}</p>
                    </td>
                    <td class="py-4 pr-4">
                      <select data-role-id="${u.id}" ${isMe ? "disabled" : ""} class="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>Usuario</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>Administrador</option>
                      </select>
                    </td>
                    <td class="py-4 pr-4">
                      <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_banned ? "bg-red-50 text-red-700" : "bg-accent/10 text-accent"}">${u.is_banned ? "Suspendido" : "Activo"}</span>
                    </td>
                    <td class="py-4 pr-4 font-medium text-text/70">${u.publication_count}</td>
                    <td class="py-4 pr-4 text-text/60">${formatDate(u.created_at)}</td>
                    <td class="py-4 text-right">
                      ${isMe
                        ? '<span class="text-xs text-text/50">Tu cuenta está protegida</span>'
                        : `<div class="flex justify-end gap-2">
                            <button data-action="ban" data-user-id="${u.id}" data-banned="${u.is_banned}" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition ${u.is_banned ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-primary/10 text-primary hover:bg-primary/20"}">${u.is_banned ? "Restablecer" : "Suspender"}</button>
                            <button data-action="delete" data-user-id="${u.id}" data-user-name="${escapeHtml(u.name || "Sin nombre")}" class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition">Eliminar</button>
                          </div>`}
                    </td>
                  </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      `;
    };

    window.loadUsers = async () => {
      container.innerHTML = '<p class="py-8 text-center text-sm text-text/60">Cargando usuarios…</p>';
      try {
        const users = await api.getAdminUsers(searchInput.value.trim());
        render(users);
      } catch (err) {
        container.innerHTML = '<p class="rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">No se pudieron cargar los usuarios.</p>';
        showMsg(err.message || "No se pudieron cargar los usuarios.", "error");
      }
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      loadUsers();
    });

    container.addEventListener("change", async (e) => {
      const select = e.target.closest("select[data-role-id]");
      if (!select) return;
      try {
        await api.updateAdminUser(select.dataset.roleId, { role: select.value });
        showMsg("Rol actualizado correctamente.");
        loadUsers();
      } catch (err) {
        showMsg(err.message || "No se pudo actualizar el rol.", "error");
        loadUsers();
      }
    });

    container.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const { action, userId, banned, userName } = btn.dataset;

      if (action === "ban") {
        const willBan = banned !== "true";
        if (!confirm(willBan ? "¿Suspender esta cuenta? La persona perderá acceso inmediatamente." : "¿Restablecer el acceso a esta cuenta?")) return;
        try {
          await api.updateAdminUser(userId, { is_banned: willBan });
          showMsg(willBan ? "Cuenta suspendida correctamente." : "Acceso restablecido correctamente.");
          loadUsers();
        } catch (err) {
          showMsg(err.message || "No se pudo actualizar el estado.", "error");
        }
      }
      if (action === "delete") {
        if (!confirm(`¿Eliminar a ${userName}? También se eliminarán todas sus publicaciones. Esta acción no se puede deshacer.`)) return;
        try {
          await api.deleteAdminUser(userId);
          showMsg("Usuario eliminado correctamente.");
          loadUsers();
          if (activeTab === "dashboard") loadDashboard();
        } catch (err) {
          showMsg(err.message || "No se pudo eliminar el usuario.", "error");
        }
      }
    });
  };

  // Initial load
  attachDashboardListeners();
  loadDashboard();

  return section;
};

export default AdminPage;

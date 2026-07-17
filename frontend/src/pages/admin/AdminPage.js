import { navigateTo } from "../../router/router.js";
import { api } from "../../services/api.js";
import { getUser } from "../../utils/auth.js";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Sin fecha";

const AdminPage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto w-full max-w-6xl space-y-6";

  const user = getUser() || {};

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

    <div id="admin-error" class="hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"></div>

    <section aria-label="Resumen" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <p class="text-sm text-text/60">Últimas publicaciones</p>
            <p id="recent-count" class="mt-2 font-display text-3xl font-bold text-text">—</p>
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
            <p class="mt-1 text-sm text-text/60">Las cinco publicaciones activas más recientes.</p>
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

  const activeCount = section.querySelector("#active-count");
  const categoryCount = section.querySelector("#category-count");
  const recentCount = section.querySelector("#recent-count");
  const serviceStatus = section.querySelector("#service-status");
  const categoryBadge = section.querySelector("#category-badge");
  const categoryList = section.querySelector("#category-list");
  const recentPublications = section.querySelector("#recent-publications");
  const errorBox = section.querySelector("#admin-error");
  const usersContainer = section.querySelector("#admin-users");
  const userMessage = section.querySelector("#user-management-message");
  const searchForm = section.querySelector("#user-search-form");
  const searchInput = section.querySelector("#user-search");

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
              (publication) => `
                <tr class="transition hover:bg-background/70">
                  <td class="py-4 pr-4 font-semibold text-text">${escapeHtml(publication.title || "Sin título")}</td>
                  <td class="py-4 pr-4"><span class="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-text/70">${escapeHtml(publication.category || "Sin categoría")}</span></td>
                  <td class="py-4 pr-4 font-medium text-accent">$${Number(publication.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="py-4 text-text/60">${formatDate(publication.created_at)}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  const loadDashboard = async () => {
    errorBox.classList.add("hidden");
    serviceStatus.innerHTML = '<span class="h-2 w-2 rounded-full bg-text/30"></span>Cargando';

    try {
      const [publicationResponse, categories] = await Promise.all([
        api.getPublications({ status: "active", page: 1, limit: 5 }),
        api.getCategories(),
      ]);
      const publications = publicationResponse.data || [];
      const total = publicationResponse.pagination?.total || publications.length;

      activeCount.textContent = total.toLocaleString("es-CO");
      categoryCount.textContent = categories.length.toLocaleString("es-CO");
      recentCount.textContent = publications.length.toLocaleString("es-CO");
      categoryBadge.textContent = categories.length;
      serviceStatus.innerHTML = '<span class="h-2 w-2 rounded-full bg-accent"></span>Operativo';
      serviceStatus.className = "mt-3 inline-flex items-center gap-2 text-sm font-semibold text-accent";

      categoryList.innerHTML = categories.length
        ? categories
            .map(
              (category) =>
                `<span class="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-text/70">${escapeHtml(category.name)}</span>`,
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

  const showUserMessage = (message, type = "success") => {
    userMessage.textContent = message;
    userMessage.className = `mt-4 rounded-lg px-4 py-3 text-sm ${
      type === "success" ? "bg-accent/10 text-accent" : "bg-red-50 text-red-700"
    }`;
  };

  const renderUsers = (users) => {
    if (users.length === 0) {
      usersContainer.innerHTML = '<p class="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-text/60">No se encontraron usuarios.</p>';
      return;
    }

    usersContainer.innerHTML = `
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
            .map((managedUser) => {
              const isCurrentUser = managedUser.id === user.id;
              const displayName = escapeHtml(managedUser.name || "Sin nombre");
              const email = escapeHtml(managedUser.email);
              return `
                <tr class="align-middle transition hover:bg-background/70">
                  <td class="py-4 pr-4">
                    <p class="font-semibold text-text">${displayName}${isCurrentUser ? ' <span class="ml-1 text-xs font-medium text-text/50">(tú)</span>' : ""}</p>
                    <p class="mt-0.5 text-xs text-text/60">${email}</p>
                  </td>
                  <td class="py-4 pr-4">
                    <select data-role-id="${managedUser.id}" ${isCurrentUser ? "disabled" : ""} class="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-text outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="user" ${managedUser.role === "user" ? "selected" : ""}>Usuario</option>
                      <option value="admin" ${managedUser.role === "admin" ? "selected" : ""}>Administrador</option>
                    </select>
                  </td>
                  <td class="py-4 pr-4">
                    <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${managedUser.is_banned ? "bg-red-50 text-red-700" : "bg-accent/10 text-accent"}">${managedUser.is_banned ? "Suspendido" : "Activo"}</span>
                  </td>
                  <td class="py-4 pr-4 font-medium text-text/70">${managedUser.publication_count}</td>
                  <td class="py-4 pr-4 text-text/60">${formatDate(managedUser.created_at)}</td>
                  <td class="py-4 text-right">
                    ${
                      isCurrentUser
                        ? '<span class="text-xs text-text/50">Tu cuenta está protegida</span>'
                        : `<div class="flex justify-end gap-2">
                            <button data-action="ban" data-user-id="${managedUser.id}" data-banned="${managedUser.is_banned}" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition ${managedUser.is_banned ? "bg-accent/10 text-accent hover:bg-accent/20" : "bg-primary/10 text-primary hover:bg-primary/20"}">${managedUser.is_banned ? "Restablecer" : "Suspender"}</button>
                            <button data-action="delete" data-user-id="${managedUser.id}" data-user-name="${displayName}" class="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100">Eliminar</button>
                          </div>`
                    }
                  </td>
                </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    `;
  };

  const loadUsers = async () => {
    usersContainer.innerHTML = '<p class="py-8 text-center text-sm text-text/60">Cargando usuarios…</p>';
    try {
      const users = await api.getAdminUsers(searchInput.value.trim());
      renderUsers(users);
    } catch (error) {
      usersContainer.innerHTML = '<p class="rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">No se pudieron cargar los usuarios.</p>';
      showUserMessage(error.message || "No se pudieron cargar los usuarios.", "error");
    }
  };

  section.querySelector("#refresh-dashboard").addEventListener("click", loadDashboard);
  section.querySelector("#view-listings").addEventListener("click", () => navigateTo("/explorar"));
  section.querySelector("#create-listing").addEventListener("click", () => navigateTo("/crear-publicacion"));
  section.querySelector("#browse-listings").addEventListener("click", () => navigateTo("/explorar"));
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadUsers();
  });
  usersContainer.addEventListener("change", async (event) => {
    const select = event.target.closest("select[data-role-id]");
    if (!select) return;
    try {
      await api.updateAdminUser(select.dataset.roleId, { role: select.value });
      showUserMessage("Rol actualizado correctamente.");
      loadUsers();
    } catch (error) {
      showUserMessage(error.message || "No se pudo actualizar el rol.", "error");
      loadUsers();
    }
  });
  usersContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, userId, banned, userName } = button.dataset;

    if (action === "ban") {
      const willBan = banned !== "true";
      const confirmation = willBan
        ? "¿Suspender esta cuenta? La persona perderá acceso inmediatamente."
        : "¿Restablecer el acceso a esta cuenta?";
      if (!confirm(confirmation)) return;
      try {
        await api.updateAdminUser(userId, { is_banned: willBan });
        showUserMessage(willBan ? "Cuenta suspendida correctamente." : "Acceso restablecido correctamente.");
        loadUsers();
      } catch (error) {
        showUserMessage(error.message || "No se pudo actualizar el estado de la cuenta.", "error");
      }
      return;
    }

    if (action === "delete") {
      if (!confirm(`¿Eliminar a ${userName}? También se eliminarán todas sus publicaciones. Esta acción no se puede deshacer.`)) return;
      try {
        await api.deleteAdminUser(userId);
        showUserMessage("Usuario eliminado correctamente.");
        loadUsers();
        loadDashboard();
      } catch (error) {
        showUserMessage(error.message || "No se pudo eliminar el usuario.", "error");
      }
    }
  });

  loadDashboard();
  loadUsers();
  return section;
};

export default AdminPage;

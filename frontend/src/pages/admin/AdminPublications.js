import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { formatDate, escapeHtml } from "../../utils/helpers.js";

/**
 * Módulo de gestión de publicaciones del panel admin
 * Maneja: tabla, filtros, búsqueda, paginación, eliminación
 */
export const AdminPublications = {
  currentPage: 1,
  currentStatus: "",
  currentSearch: "",

  async render() {
    const section = document.createElement("section");
    section.className = "admin-publications";

    const template = loadTemplate("AdminPublications");
    section.innerHTML = template;

    // Referencias
    this.elements = {
      container: section.querySelector("#publications-container"),
      pagination: section.querySelector("#publications-pagination"),
      statusFilter: section.querySelector("#pub-status-filter"),
      searchInput: section.querySelector("#pub-search"),
    };

    this.attachListeners();
    await this.loadPublications(1);

    return section;
  },

  attachListeners() {
    const { statusFilter, searchInput, pagination } = this.elements;

    statusFilter?.addEventListener("change", () => {
      this.currentStatus = statusFilter.value;
      this.loadPublications(1);
    });

    searchInput?.addEventListener("input", () => {
      this.currentSearch = searchInput.value.trim();
      this.loadPublications(1);
    });

    // Delegación para paginación
    pagination?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-page]");
      if (btn) this.loadPublications(parseInt(btn.dataset.page, 10));
    });

    // Delegación para acciones de tabla
    this.elements.container?.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const { action, id } = btn.dataset;
      if (action === "delete") await this.deletePublication(id);
    });
  },

  async loadPublications(page = 1) {
    const { container, pagination } = this.elements;
    this.currentPage = page;

    if (container) {
      container.innerHTML = '<p class="admin-loading">Cargando…</p>';
    }

    try {
      const params = { page, limit: 20 };
      if (this.currentStatus) params.status = this.currentStatus;
      if (this.currentSearch) params.search = this.currentSearch;

      const res = await api.getAdminPublications(params);
      this.renderTable(container, res.data || []);
      this.renderPagination(pagination, res.pagination);
    } catch (err) {
      if (container) {
        container.innerHTML = `<p class="error-message">${err.message}</p>`;
      }
      if (pagination) pagination.innerHTML = "";
    }
  },

  renderTable(container, pubs) {
    if (!container) return;

    if (pubs.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay publicaciones.</p>';
      return;
    }

    container.innerHTML = `
      <table class="table table--admin">
        <thead>
          <tr>
            <th>Publicación</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Precio</th>
            <th>Usuario</th>
            <th>Fecha</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${pubs
            .map(
              (p) => `
            <tr>
              <td class="font-semibold">${escapeHtml(p.title || "Sin título")}</td>
              <td>${escapeHtml(p.category || "—")}</td>
              <td><span class="status-badge status-badge--${p.status}">${this.getStatusLabel(p.status)}</span></td>
              <td class="text-accent font-medium">$${Number(p.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td class="text-muted">${escapeHtml(p.user_name || p.user_id || "—")}</td>
              <td class="text-muted">${formatDate(p.created_at)}</td>
              <td class="text-right">
                <button data-action="delete" data-id="${p.id}" class="btn btn--danger btn--sm">Eliminar</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  },

  renderPagination(paginationEl, data) {
    if (!paginationEl || !data || data.totalPages <= 1) {
      if (paginationEl) paginationEl.innerHTML = "";
      return;
    }

    const { page, totalPages } = data;
    let html = '<nav class="pagination" aria-label="Paginación">';

    if (page > 1) {
      html += `<button data-page="${page - 1}" class="pagination__btn">Anterior</button>`;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      html += `<button data-page="${i}" class="pagination__btn ${i === page ? "pagination__btn--active" : ""}">${i}</button>`;
    }

    if (page < totalPages) {
      html += `<button data-page="${page + 1}" class="pagination__btn">Siguiente</button>`;
    }

    html += "</nav>";
    paginationEl.innerHTML = html;
  },

  async deletePublication(id) {
    if (!confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;

    try {
      await api.deleteAdminPublication(id);
      this.loadPublications(this.currentPage);
    } catch (err) {
      alert(err.message);
    }
  },

  getStatusLabel(status) {
    const labels = { active: "Activa", sold: "Vendida", inactive: "Inactiva" };
    return labels[status] || status;
  },
};
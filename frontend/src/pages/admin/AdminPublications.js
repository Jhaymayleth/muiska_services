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

    // Load table template and extract row template
    const tableTemplate = loadTemplate("AdminPublicationsTable");
    this.rowTemplate = section.querySelector("#admin-publication-row").textContent;

    // Referencias
    this.elements = {
      container: section.querySelector("#publications-container"),
      tbody: section.querySelector("#publications-tbody"),
      pagination: section.querySelector("#publications-pagination"),
      statusFilter: section.querySelector("#pub-status-filter"),
      searchInput: section.querySelector("#pub-search"),
    };

    // Inject table template into container
    if (this.elements.container) {
      this.elements.container.innerHTML = tableTemplate;
      this.elements.tbody = this.elements.container.querySelector("#publications-tbody");
    }

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
    const { tbody, pagination } = this.elements;
    this.currentPage = page;

    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-loading">Cargando…</td></tr>';
    }

    try {
      const params = { page, limit: 20 };
      if (this.currentStatus) params.status = this.currentStatus;
      if (this.currentSearch) params.search = this.currentSearch;

      const res = await api.getAdminPublications(params);
      this.renderTable(res.data || []);
      this.renderPagination(pagination, res.pagination);
    } catch (err) {
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" class="error-message">${err.message}</td></tr>`;
      }
      if (pagination) pagination.innerHTML = "";
    }
  },

  renderTable(pubs) {
    const { tbody } = this.elements;
    if (!tbody) return;

    if (pubs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay publicaciones.</td></tr>';
      return;
    }

    tbody.innerHTML = pubs
      .map(
        (p) =>
          this.rowTemplate
            .replace("{{title}}", escapeHtml(p.title || "Sin título"))
            .replace("{{category}}", escapeHtml(p.category || "—"))
            .replace("{{statusLabel}}", this.getStatusLabel(p.status))
            .replace("{{statusClass}}", p.status)
            .replace("{{price}}", Number(p.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
            .replace("{{userName}}", escapeHtml(p.user_name || p.user_id || "—"))
            .replace("{{date}}", formatDate(p.created_at))
            .replace("{{id}}", p.id)
      )
      .join("");
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
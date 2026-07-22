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
  currentCategory: "",

  /**
   * Inicializa el módulo de publicaciones dentro del panel
   * @param {HTMLElement} panel - Contenedor del panel
   */
  init(panel) {
    // Cargar el template y colocarlo dentro del panel recibido
    const template = loadTemplate("AdminPublications");
    panel.innerHTML = template;

    // Guardar referencias a los elementos del DOM
    this.cacheElements(panel);

    // Cargar el template de la tabla y extraer la fila
    const tableTemplate = loadTemplate("AdminPublicationsTable").replace("{{rows}}", '<tr><td colspan="7" class="admin-loading">Loading…</td></tr>');
    if (this.elements.container) {
      this.elements.container.innerHTML = tableTemplate;
      this.elements.tbody = this.elements.container.querySelector("#publications-tbody");
      // Extraer la plantilla de la fila después de insertar la tabla
      this.rowTemplate = this.elements.container.querySelector("#admin-publication-row")?.textContent || "";
    }

    this.attachListeners();
    this.loadPublications(1);
  },

  cacheElements(panel) {
    this.elements = {
      container: panel.querySelector("#publications-container"),
      tbody: panel.querySelector("#publications-tbody"),
      pagination: panel.querySelector("#publications-pagination"),
      statusFilter: panel.querySelector("#pub-status-filter"),
      searchInput: panel.querySelector("#pub-search"),
    };
  },

  attachListeners() {
    const { statusFilter, searchInput, pagination } = this.elements;

    statusFilter?.addEventListener("change", () => {
      this.currentStatus = statusFilter.value;
      this.currentCategory = "";
      this.loadPublications(1);
    });

    searchInput?.addEventListener("input", () => {
      this.currentSearch = searchInput.value.trim();
      this.currentCategory = "";
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

      const { action, id, status } = btn.dataset;
      if (action === "delete") await this.deletePublication(id);
      if (action === "toggle-status") await this.toggleStatus(id, status);
    });
  },

  async loadPublications(page = 1) {
    const { tbody, pagination, statusFilter, searchInput } = this.elements;
    this.currentPage = page;

    if (statusFilter) statusFilter.value = this.currentStatus;
    if (searchInput) searchInput.value = this.currentSearch;

    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-loading">Loading…</td></tr>';
    }

    try {
      const params = { page, limit: 20 };
      if (this.currentStatus) params.status = this.currentStatus;
      if (this.currentSearch) params.search = this.currentSearch;
      if (this.currentCategory) params.category = this.currentCategory;

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
      tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No publications.</td></tr>';
      return;
    }

    tbody.innerHTML = pubs
      .map(
        (p) =>
          this.rowTemplate
            .replace("{{title}}", escapeHtml(p.title || "No title"))
            .replace("{{category}}", escapeHtml(p.category || "—"))
            .replace("{{statusLabel}}", this.getStatusLabel(p.status))
            .replace("{{statusClass}}", p.status)
            .replace("{{toggleLabel}}", this.getToggleLabel(p.status))
            .replace("{{price}}", Number(p.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
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
    let html = '<nav class="pagination" aria-label="Pagination">';

    if (page > 1) {
      html += `<button data-page="${page - 1}" class="pagination__btn">Previous</button>`;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      html += `<button data-page="${i}" class="pagination__btn ${i === page ? "pagination__btn--active" : ""}">${i}</button>`;
    }

    if (page < totalPages) {
      html += `<button data-page="${page + 1}" class="pagination__btn">Next</button>`;
    }

    html += "</nav>";
    paginationEl.innerHTML = html;
  },

  async toggleStatus(id, currentStatus) {
    const nextStatus = currentStatus === "active" ? "sold" : currentStatus === "sold" ? "active" : "active";
    const label = nextStatus === "sold" ? "Mark as sold" : "Reactivate";
    if (!confirm(`${label}?`)) return;

    try {
      await api.updateAdminPublication(id, { status: nextStatus });
      this.loadPublications(this.currentPage);
    } catch (err) {
      alert(err.message);
    }
  },

  async deletePublication(id) {
    if (!confirm("Delete this publication? This action cannot be undone.")) return;

    try {
      await api.deleteAdminPublication(id);
      this.loadPublications(this.currentPage);
    } catch (err) {
      alert(err.message);
    }
  },

  getStatusLabel(status) {
    const labels = { active: "Active", sold: "Sold", inactive: "Inactive" };
    return labels[status] || status;
  },

  getToggleLabel(status) {
    const labels = { active: "Mark sold", sold: "Reactivate", inactive: "Activate" };
    return labels[status] || "Change status";
  },
};
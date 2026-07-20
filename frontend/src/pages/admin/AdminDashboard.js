/**
 * Módulo: AdminDashboard
 * Panel de resumen - stats, publicaciones recientes, acciones rápidas, categorías
 */

import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { formatDate, escapeHtml, formatNumber } from "../../utils/helpers.js";

export const AdminDashboard = {
  // Elementos del DOM
  elements: {},

  /**
   * Inicializa el dashboard y carga datos
   * @param {HTMLElement} panel - Elemento contenedor del panel
   */
  init(panel) {
    this.cacheElements(panel);
    this.attachListeners();
    this.loadDashboard();
  },

  /**
   * Guarda referencias a elementos del DOM
   */
  cacheElements(panel) {
    this.elements = {
      activeCount: panel.querySelector("#active-count"),
      categoryCount: panel.querySelector("#category-count"),
      totalCount: panel.querySelector("#total-count"),
      serviceStatus: panel.querySelector("#service-status"),
      categoryBadge: panel.querySelector("#category-badge"),
      categoryList: panel.querySelector("#category-list"),
      recentPublications: panel.querySelector("#recent-publications"),
      errorBox: panel.querySelector("#admin-error"),
      refreshBtn: panel.querySelector("#refresh-dashboard"),
      viewListingsBtn: panel.querySelector("#view-listings"),
      createListingBtn: panel.querySelector("#create-listing"),
      browseListingsBtn: panel.querySelector("#browse-listings"),
    };
  },

  /**
   * Adjunta event listeners
   */
  attachListeners() {
    const { refreshBtn, viewListingsBtn, createListingBtn, browseListingsBtn } = this.elements;

    refreshBtn?.addEventListener("click", () => this.loadDashboard());
    viewListingsBtn?.addEventListener("click", () => navigateTo("/explorar"));
    createListingBtn?.addEventListener("click", () => navigateTo("/crear-publicacion"));
    browseListingsBtn?.addEventListener("click", () => navigateTo("/explorar"));
  },

  /**
   * Carga todos los datos del dashboard
   */
  async loadDashboard() {
    const { errorBox, serviceStatus } = this.elements;

    // Reset UI
    errorBox?.classList.add("hidden");
    if (serviceStatus) {
      serviceStatus.innerHTML = '<span class="admin-spinner"></span>Cargando';
      serviceStatus.className = "admin-stat-card__status admin-stat-card__status--loading";
    }

    try {
      // Paralelizar llamadas
      const [pubResponse, categories] = await Promise.all([
        api.getPublications({ status: "active", page: 1, limit: 5 }),
        api.getCategories(),
      ]);

      const publications = pubResponse.data || [];
      const total = pubResponse.pagination?.total || publications.length;

      // Actualizar contadores
      this.updateCounter("activeCount", total);
      this.updateCounter("categoryCount", categories.length);
      this.updateCounter("totalCount", total);
      if (this.elements.categoryBadge) this.elements.categoryBadge.textContent = categories.length;

      // Estado servicio
      this.setServiceStatus(true);

      // Lista de categorías (chips)
      this.renderCategoryChips(categories);

      // Tabla de publicaciones recientes
      this.renderRecentPublications(publications);
    } catch (error) {
      this.setServiceStatus(false);
      errorBox.textContent = error.message || "No se pudieron cargar los datos del panel.";
      errorBox.classList.remove("hidden");
      this.elements.recentPublications.innerHTML = `
        <p class="admin-error">No se pudieron cargar las publicaciones.</p>
      `;
    }
  },

  updateCounter(elementId, value) {
    const el = this.elements[elementId];
    if (el) el.textContent = Number(value).toLocaleString("es-CO");
  },

  setServiceStatus(ok) {
    const { serviceStatus } = this.elements;
    if (!serviceStatus) return;

    if (ok) {
      serviceStatus.innerHTML = '<span class="admin-status-dot admin-status-dot--ok"></span>Operativo';
      serviceStatus.className = "admin-stat-card__status admin-stat-card__status--ok";
    } else {
      serviceStatus.innerHTML = '<span class="admin-status-dot admin-status-dot--error"></span>No disponible';
      serviceStatus.className = "admin-stat-card__status admin-stat-card__status--error";
    }
  },

  renderCategoryChips(categories) {
    const { categoryList } = this.elements;
    if (!categoryList) return;

    if (categories.length === 0) {
      categoryList.innerHTML = '<span class="text-muted">No hay categorías registradas.</span>';
      return;
    }

    categoryList.innerHTML = categories
      .map(
        (c) =>
          `<span class="admin-chip">${escapeHtml(c.name)}</span>`
      )
      .join("");
  },

  renderRecentPublications(publications) {
    const { recentPublications } = this.elements;
    if (!recentPublications) return;

    if (publications.length === 0) {
      recentPublications.innerHTML = `
        <p class="admin-empty">No hay publicaciones activas todavía.</p>
      `;
      return;
    }

    recentPublications.innerHTML = `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Publicación</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${publications
              .map(
                (p) => `
              <tr>
                <td class="font-semibold">${escapeHtml(p.title || "Sin título")}</td>
                <td><span class="admin-chip">${escapeHtml(p.category || "Sin categoría")}</span></td>
                <td class="font-medium text-primary">$${formatNumber(p.price)}</td>
                <td class="text-muted">${formatDate(p.created_at)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  },
};
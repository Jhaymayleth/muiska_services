import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { formatDate, escapeHtml, formatNumber } from "../../utils/helpers.js";
import { AdminPublications } from "./AdminPublications.js";

export const AdminDashboard = {
  elements: {},
  switchTab: null,

  init(panel, switchTabCb) {
    this.switchTab = switchTabCb;
    panel.innerHTML = loadTemplate("AdminDashboard");
    this.cacheElements(panel);
    this.elements.refreshBtn = document.querySelector("#refresh-dashboard");
    this.attachListeners();
    this.loadDashboard();
  },

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
      viewListingsBtn: panel.querySelector("#view-listings"),
      createListingBtn: panel.querySelector("#create-listing"),
      browseListingsBtn: panel.querySelector("#browse-listings"),
    };
  },

  attachListeners() {
    const { refreshBtn, viewListingsBtn, createListingBtn, browseListingsBtn, activeCount, categoryCount, totalCount } = this.elements;

    refreshBtn?.addEventListener("click", () => this.loadDashboard());
    viewListingsBtn?.addEventListener("click", () => this.goToPublications());
    createListingBtn?.addEventListener("click", () => navigateTo("/create"));
    browseListingsBtn?.addEventListener("click", () => this.goToCategories());

    activeCount?.closest(".admin-stat-card")?.addEventListener("click", () => this.goToPublications());
    categoryCount?.closest(".admin-stat-card")?.addEventListener("click", () => this.goToCategories());
    totalCount?.closest(".admin-stat-card")?.addEventListener("click", () => this.goToPublications());
  },

  goToPublications() {
    AdminPublications.currentCategory = "";
    this.switchTab("publications");
  },

  goToCategories() {
    this.switchTab("categories");
  },

  /**
   * Carga todos los datos del dashboard
   */
  async loadDashboard() {
    const { errorBox, serviceStatus } = this.elements;

    // Reset UI
    errorBox?.classList.add("hidden");
    if (serviceStatus) {
      serviceStatus.innerHTML = '<span class="admin-spinner"></span>Loading';
      serviceStatus.className = "admin-stat-card__status admin-stat-card__status--loading";
    }

    try {
      const [stats, pubResponse, categories] = await Promise.all([
        api.request("/admin/dashboard"),
        api.getPublications({ status: "active", page: 1, limit: 5 }),
        api.getCategories(),
      ]);

      if (stats?.totals) {
        this.updateCounter("activeCount", stats.totals.activePublications);
        this.updateCounter("categoryCount", stats.totals.categories);
        this.updateCounter("totalCount", stats.totals.publications);
      }

      const publications = pubResponse.data || [];
      if (this.elements.categoryBadge) this.elements.categoryBadge.textContent = categories.length;

      // Estado servicio
      this.setServiceStatus(true);

      // Lista de categorías (chips)
      this.renderCategoryChips(categories);

      // Tabla de publicaciones recientes
      this.renderRecentPublications(publications);
    } catch (error) {
      this.setServiceStatus(false);
      errorBox.textContent = error.message || "Could not load dashboard data.";
      errorBox.classList.remove("hidden");
      this.elements.recentPublications.innerHTML = `
        <p class="admin-error">Could not load publications.</p>
      `;
    }
  },

  updateCounter(elementId, value) {
    const el = this.elements[elementId];
    if (el) el.textContent = Number(value).toLocaleString("en-US");
  },

  setServiceStatus(ok) {
    const { serviceStatus } = this.elements;
    if (!serviceStatus) return;

    if (ok) {
      serviceStatus.innerHTML = '<span class="admin-status-dot admin-status-dot--ok"></span>Operational';
      serviceStatus.className = "admin-stat-card__status admin-stat-card__status--ok";
    } else {
      serviceStatus.innerHTML = '<span class="admin-status-dot admin-status-dot--error"></span>Unavailable';
      serviceStatus.className = "admin-stat-card__status admin-stat-card__status--error";
    }
  },

  renderCategoryChips(categories) {
    const { categoryList } = this.elements;
    if (!categoryList) return;

    if (categories.length === 0) {
      categoryList.innerHTML = '<span class="text-muted">No categories registered.</span>';
      return;
    }

    categoryList.innerHTML = categories
      .map(
        (c) =>
          `<span class="admin-chip admin-chip--clickable" data-category="${escapeHtml(c.slug || c.name)}">${escapeHtml(c.name)}</span>`
      )
      .join("");

    categoryList.querySelectorAll(".admin-chip--clickable").forEach((chip) => {
      chip.addEventListener("click", () => {
        AdminPublications.currentCategory = chip.dataset.category;
        AdminPublications.currentStatus = "";
        AdminPublications.currentSearch = "";
        this.switchTab("publications");
      });
    });
  },

  renderRecentPublications(publications) {
    const { recentPublications } = this.elements;
    if (!recentPublications) return;

    if (publications.length === 0) {
      recentPublications.innerHTML = `
        <p class="admin-empty">No active listings yet.</p>
      `;
      return;
    }

    recentPublications.innerHTML = `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Category</th>
              <th>Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${publications
              .map(
                (p) => `
              <tr class="admin-table__row--clickable" data-id="${escapeHtml(p.id)}" data-title="${escapeHtml(p.title || "")}">
                <td class="font-semibold">${escapeHtml(p.title || "No title")}</td>
                <td><span class="admin-chip">${escapeHtml(p.category || "No category")}</span></td>
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

    recentPublications.querySelectorAll(".admin-table__row--clickable").forEach((row) => {
      row.addEventListener("click", () => {
        const title = row.dataset.title;
        AdminPublications.currentCategory = "";
        AdminPublications.currentSearch = title;
        this.switchTab("publications");
      });
    });
  },
};
/**
 * Módulo: AdminCategories
 * Gestión de categorías - CRUD completo con modal
 */

import { api } from "../../services/api.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { escapeHtml, formatDate } from "../../utils/helpers.js";

export const AdminCategories = {
  // Referencias DOM
  elements: {},

  /**
   * Inicializa el módulo de categorías
   * @param {HTMLElement} panel - Contenedor del panel
   */
  init(panel) {
    panel.innerHTML = loadTemplate("AdminCategories");
    this.cacheElements(panel);
    this.attachListeners();
    this.loadCategories();
  },

  cacheElements(panel) {
    this.elements = {
      container: panel.querySelector("#categories-container"),
      modal: panel.querySelector("#category-modal"),
      form: panel.querySelector("#category-form"),
      titleEl: panel.querySelector("#category-modal-title"),
      idInput: panel.querySelector("#category-id"),
      nameInput: panel.querySelector("#category-name"),
      descInput: panel.querySelector("#category-description"),
      newBtn: panel.querySelector("#btn-new-category"),
      closeBtn: panel.querySelector("#close-category-modal"),
      cancelBtn: panel.querySelector("#cancel-category"),
    };
  },

  attachListeners() {
    const { newBtn, closeBtn, cancelBtn, modal, form } = this.elements;

    newBtn?.addEventListener("click", () => this.openModal());
    closeBtn?.addEventListener("click", () => this.closeModal());
    cancelBtn?.addEventListener("click", () => this.closeModal());

    // Cerrar al click en overlay
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Submit form
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCategory();
    });

    // Delegación en tabla: editar/eliminar
    this.elements.container?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const { action, id } = btn.dataset;
      if (action === "edit") this.editCategory(id);
      if (action === "delete") this.deleteCategory(id);
    });
  },

  /**
   * Carga lista de categorías desde API
   */
  async loadCategories() {
    const { container } = this.elements;
    if (!container) return;

    container.innerHTML = '<p class="admin-loading">Loading…</p>';

    try {
      const categories = await api.getCategories();
      this.renderTable(categories);
    } catch (err) {
      container.innerHTML = `<p class="admin-error">${err.message}</p>`;
    }
  },

  /**
   * Renderiza tabla de categorías
   */
  renderTable(categories) {
    const { container } = this.elements;
    if (!container) return;

    if (categories.length === 0) {
      container.innerHTML = '<p class="admin-empty">No categories.</p>';
      return;
    }

    container.innerHTML = `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Date</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${categories
              .map(
                (c) => `
              <tr>
                <td class="font-semibold">${escapeHtml(c.name)}</td>
                <td class="text-muted">${escapeHtml(c.description || "—")}</td>
                <td class="text-muted">${formatDate(c.created_at)}</td>
                <td class="text-right">
                  <button data-action="edit" data-id="${c.id}" class="btn btn--ghost btn--sm">Edit</button>
                  <button data-action="delete" data-id="${c.id}" class="btn btn--danger btn--sm">Delete</button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Abre modal para crear/editar
   */
  openModal(category = null) {
    this.elements.form?.reset();
    this.elements.idInput.value = "";

    if (category) {
      this.elements.titleEl.textContent = "Edit Category";
      this.elements.idInput.value = category.id;
      this.elements.nameInput.value = category.name;
      this.elements.descInput.value = category.description || "";
    } else {
      this.elements.titleEl.textContent = "New Category";
    }

    this.elements.modal?.classList.remove("hidden");
    this.elements.modal?.classList.add("flex");
    this.elements.nameInput?.focus();
  },

  closeModal() {
    this.elements.modal?.classList.add("hidden");
    this.elements.modal?.classList.remove("flex");
  },

  /**
   * Guarda categoría (crear o actualizar)
   */
  async saveCategory() {
    const id = this.elements.idInput.value;
    const data = {
      name: this.elements.nameInput.value.trim(),
      description: this.elements.descInput.value.trim() || null,
    };

    try {
      if (id) {
        await api.updateCategory(id, data);
      } else {
        await api.createCategory(data);
      }

      this.closeModal();
      this.loadCategories();
    } catch (err) {
      alert(err.message);
    }
  },

  /**
   * Carga categoría y abre modal en modo edición
   */
  async editCategory(id) {
    try {
      const category = await api.getCategory(id);
      this.openModal(category);
    } catch (err) {
      alert(err.message);
    }
  },

  /**
   * Elimina categoría tras confirmación
   */
  async deleteCategory(id) {
    if (!confirm("Delete this category? Listings using it will become uncategorized.")) return;

    try {
      await api.deleteCategory(id);
      this.loadCategories();
    } catch (err) {
      alert(err.message);
    }
  },
};
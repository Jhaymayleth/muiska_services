/**
 * Módulo: AdminUsers
 * Gestión de usuarios - tabla, búsqueda, roles, ban/eliminar
 */

import { api } from "../../services/api.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { escapeHtml, formatDate } from "../../utils/helpers.js";

export const AdminUsers = {
  currentUser: null,

  elements: {},

  init(panel) {
    panel.innerHTML = loadTemplate("AdminUsers");
    this.currentUser = panel.dataset.currentUserId || null;
    this.cacheElements(panel);
    this.loadTableTemplate();
    this.attachListeners();
    this.loadUsers();
  },

  cacheElements(panel) {
    this.elements = {
      container: panel.querySelector("#admin-users"),
      searchInput: panel.querySelector("#user-search"),
      searchForm: panel.querySelector("#user-search-form"),
      messageEl: panel.querySelector("#user-management-message"),
    };
  },

  loadTableTemplate() {
    const tableTemplate = loadTemplate("AdminUsersTable").replace("{{rows}}", '<tr><td colspan="6" class="admin-loading">Loading users…</td></tr>');
    this.rowTemplate = this.extractRowTemplate(tableTemplate);

    // Inject table template into container
    const { container } = this.elements;
    if (container) {
      container.innerHTML = tableTemplate;
    }
  },

  extractRowTemplate(tableTemplate) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(tableTemplate, "text/html");
    const script = doc.querySelector("#admin-user-row");
    return script ? script.textContent : "";
  },

  attachListeners() {
    const { searchForm, container } = this.elements;

    // Búsqueda
    searchForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.loadUsers();
    });

    // Delegación: cambio de rol
    container?.addEventListener("change", async (e) => {
      const select = e.target.closest("select[data-role-id]");
      if (!select) return;

      const userId = select.dataset.roleId;
      const newRole = select.value;

      try {
        await api.updateAdminUser(userId, { role: newRole });
        this.showMessage("Role updated successfully.", "success");
        this.loadUsers();
      } catch (err) {
        this.showMessage(err.message || "Could not update role.", "error");
        this.loadUsers(); // Resetear select
      }
    });

    // Delegación: ban/eliminar
    container?.addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const { action, userId, banned, userName } = btn.dataset;

      if (action === "ban") {
        const willBan = banned !== "true";
        if (!confirm(willBan ? "Suspend this account? They will lose access immediately." : "Restore access to this account?")) return;

        try {
          await api.updateAdminUser(userId, { is_banned: willBan });
          this.showMessage(willBan ? "Account suspended successfully." : "Access restored successfully.", "success");
          this.loadUsers();
        } catch (err) {
          this.showMessage(err.message || "Could not update status.", "error");
        }
      }

      if (action === "delete") {
        if (!confirm(`Delete ${userName}? All their listings will also be deleted. This cannot be undone.`)) return;

        try {
          await api.deleteAdminUser(userId);
          this.showMessage("User deleted successfully.", "success");
          this.loadUsers();
          // Notificar al dashboard si está activo
          window.dispatchEvent(new CustomEvent("admin:userDeleted"));
        } catch (err) {
          this.showMessage(err.message || "Could not delete user.", "error");
        }
      }
    });
  },

  async loadUsers() {
    const { container, searchInput } = this.elements;
    if (!container) {
      console.error("AdminUsers: container not found");
      return;
    }

    let tbody = container.querySelector("#admin-users-tbody");
    if (!tbody) {
      this.loadTableTemplate();
      tbody = container.querySelector("#admin-users-tbody");
    }
    if (!tbody) {
      container.innerHTML = '<p class="admin-error">Failed to load table template</p>';
      return;
    }

    tbody.innerHTML = '<tr><td colspan="6" class="admin-loading">Loading users…</td></tr>';

    try {
      const search = searchInput?.value.trim() || "";
      const users = await api.getAdminUsers(search);
      this.renderTable(users);
    } catch (err) {
      const tbody2 = container.querySelector("#admin-users-tbody");
      if (tbody2) {
        tbody2.innerHTML = `<tr><td colspan="6" class="admin-error">${escapeHtml(err.message)}</td></tr>`;
      }
      this.showMessage(err.message || "Could not load users.", "error");
    }
  },

  renderTable(users) {
    const { container } = this.elements;
    if (!container) return;

    const tbody = container.querySelector("#admin-users-tbody");
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users
      .map((u) => {
        const isMe = u.id === this.currentUser;
        const meLabel = isMe ? ' <span class="text-muted text-xs">(you)</span>' : "";
        const rowClass = isMe ? "admin-table__row--current" : "";
        const meDisabled = isMe ? "disabled" : "";
        const isUserSelected = u.role === "user" ? "selected" : "";
        const isAdminSelected = u.role === "admin" ? "selected" : "";
        const statusClass = u.is_banned ? "banned" : "active";
        const statusLabel = u.is_banned ? "Suspended" : "Active";

        let actions;
        if (isMe) {
          actions = '<span class="text-xs text-muted">Your account is protected</span>';
        } else {
          const banBtnClass = u.is_banned ? "btn--success" : "";
          const banBtnText = u.is_banned ? "Restore" : "Suspend";
          actions = `
            <div class="flex justify-end gap-2">
              <button data-action="ban" data-user-id="${u.id}" data-banned="${u.is_banned}" class="btn btn--ghost btn--sm ${banBtnClass}">
                ${banBtnText}
              </button>
              <button data-action="delete" data-user-id="${u.id}" data-user-name="${escapeHtml(u.name || "No name")}" class="btn btn--danger btn--sm">Delete</button>
            </div>
          `;
        }

        return this.rowTemplate
          .replace("{{rowClass}}", rowClass)
          .replace("{{name}}", escapeHtml(u.name || "No name"))
          .replace("{{meLabel}}", meLabel)
          .replace("{{email}}", escapeHtml(u.email))
          .replace("{{id}}", u.id)
          .replace("{{meDisabled}}", meDisabled)
          .replace("{{isUserSelected}}", isUserSelected)
          .replace("{{isAdminSelected}}", isAdminSelected)
          .replace("{{statusClass}}", statusClass)
          .replace("{{statusLabel}}", statusLabel)
          .replace("{{publicationCount}}", u.publication_count)
          .replace("{{date}}", formatDate(u.created_at))
          .replace("{{actions}}", actions);
      })
      .join("");
  },

  showMessage(text, type = "success") {
    const { messageEl } = this.elements;
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `admin-message admin-message--${type}`;
    messageEl.hidden = false;
  },
};
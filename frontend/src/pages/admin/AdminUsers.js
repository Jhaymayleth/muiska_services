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
    this.currentUser = panel.dataset.currentUserId || null;
    this.cacheElements(panel);
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
        this.showMessage("Rol actualizado correctamente.", "success");
        this.loadUsers();
      } catch (err) {
        this.showMessage(err.message || "No se pudo actualizar el rol.", "error");
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
        if (!confirm(willBan ? "¿Suspender esta cuenta? La persona perderá acceso inmediatamente." : "¿Restablecer el acceso a esta cuenta?")) return;

        try {
          await api.updateAdminUser(userId, { is_banned: willBan });
          this.showMessage(willBan ? "Cuenta suspendida correctamente." : "Acceso restablecido correctamente.", "success");
          this.loadUsers();
        } catch (err) {
          this.showMessage(err.message || "No se pudo actualizar el estado.", "error");
        }
      }

      if (action === "delete") {
        if (!confirm(`¿Eliminar a ${userName}? También se eliminarán todas sus publicaciones. Esta acción no se puede deshacer.`)) return;

        try {
          await api.deleteAdminUser(userId);
          this.showMessage("Usuario eliminado correctamente.", "success");
          this.loadUsers();
          // Notificar al dashboard si está activo
          window.dispatchEvent(new CustomEvent("admin:userDeleted"));
        } catch (err) {
          this.showMessage(err.message || "No se pudo eliminar el usuario.", "error");
        }
      }
    });
  },

  async loadUsers() {
    const { container, searchInput } = this.elements;
    if (!container) return;

    container.innerHTML = '<p class="admin-loading">Cargando usuarios…</p>';

    try {
      const search = searchInput?.value.trim() || "";
      const users = await api.getAdminUsers(search);
      this.renderTable(users);
    } catch (err) {
      container.innerHTML = '<p class="admin-error">No se pudieron cargar los usuarios.</p>';
      this.showMessage(err.message || "No se pudieron cargar los usuarios.", "error");
    }
  },

  renderTable(users) {
    const { container } = this.elements;
    if (!container) return;

    if (users.length === 0) {
      container.innerHTML = '<p class="admin-empty">No se encontraron usuarios.</p>';
      return;
    }

    container.innerHTML = `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Publicaciones</th>
              <th>Registro</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map((u) => {
                const isMe = u.id === this.currentUser;
                return `
              <tr class="${isMe ? "admin-table__row--current" : ""}">
                <td>
                  <p class="font-semibold">${escapeHtml(u.name || "Sin nombre")}${isMe ? ' <span class="text-muted text-xs">(tú)</span>' : ""}</p>
                  <p class="text-xs text-muted">${escapeHtml(u.email)}</p>
                </td>
                <td>
                  <select data-role-id="${u.id}" ${isMe ? "disabled" : ""} class="form-select form-select--sm">
                    <option value="user" ${u.role === "user" ? "selected" : ""}>Usuario</option>
                    <option value="admin" ${u.role === "admin" ? "selected" : ""}>Administrador</option>
                  </select>
                </td>
                <td>
                  <span class="status-badge status-badge--${u.is_banned ? "banned" : "active"}">
                    ${u.is_banned ? "Suspendido" : "Activo"}
                  </span>
                </td>
                <td class="font-medium text-muted">${u.publication_count}</td>
                <td class="text-muted">${formatDate(u.created_at)}</td>
                <td class="text-right">
                  ${isMe
                    ? '<span class="text-xs text-muted">Tu cuenta está protegida</span>'
                    : `
                    <div class="flex justify-end gap-2">
                      <button data-action="ban" data-user-id="${u.id}" data-banned="${u.is_banned}" class="btn btn--ghost btn--sm ${u.is_banned ? "btn--success" : ""}">
                        ${u.is_banned ? "Restablecer" : "Suspender"}
                      </button>
                      <button data-action="delete" data-user-id="${u.id}" data-user-name="${escapeHtml(u.name || "Sin nombre")}" class="btn btn--danger btn--sm">Eliminar</button>
                    </div>
                  `}
                </td>
              </tr>
            `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  showMessage(text, type = "success") {
    const { messageEl } = this.elements;
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `admin-message admin-message--${type}`;
    messageEl.hidden = false;
  },
};
import { api } from "../../services/api.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { escapeHtml } from "../../utils/helpers.js";

export const AdminVerifiers = {
  elements: {},

  init(panel) {
    panel.innerHTML = loadTemplate("AdminVerifiers");
    this.cacheElements(panel);
    this.attachListeners();
    this.loadVerifiers();
    this.loadAllUsers();
  },

  cacheElements(panel) {
    this.elements = {
      container: panel.querySelector("#admin-verifiers"),
      searchInput: panel.querySelector("#verifier-search"),
      searchForm: panel.querySelector("#verifier-search-form"),
      clearBtn: panel.querySelector("#verifier-clear"),
      tbody: panel.querySelector("#admin-verifiers-tbody"),
      countEl: panel.querySelector("#verifiers-count"),
      messageEl: panel.querySelector("#admin-verifiers-message"),
    };
  },

  attachListeners() {
    this.elements.searchForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.loadAllUsers();
    });

    this.elements.clearBtn?.addEventListener("click", () => {
      this.elements.searchInput.value = "";
      this.loadAllUsers();
    });

    this.elements.container?.addEventListener("click", async (e) => {
      const assignBtn = e.target.closest("[data-action='assign']");
      const removeBtn = e.target.closest("[data-action='remove']");

      if (assignBtn) {
        const userId = assignBtn.dataset.userId;
        const userName = assignBtn.dataset.userName;
        if (!confirm(`Assign verifier role to ${userName}?`)) return;
        try {
          await api.assignVerifier(userId);
          this.showMessage("Verifier assigned successfully.", "success");
          this.loadAllUsers();
          this.loadVerifiers();
        } catch (err) {
          this.showMessage(err.message || "Could not assign verifier.", "error");
        }
      }

      if (removeBtn) {
        const userId = removeBtn.dataset.userId;
        const userName = removeBtn.dataset.userName;
        if (!confirm(`Remove verifier role from ${userName}?`)) return;
        try {
          await api.removeVerifier(userId);
          this.showMessage("Verifier role removed.", "success");
          this.loadAllUsers();
          this.loadVerifiers();
        } catch (err) {
          this.showMessage(err.message || "Could not remove verifier.", "error");
        }
      }
    });
  },

  async loadVerifiers() {
    try {
      const verifiers = await api.getVerifiers();
      if (this.elements.countEl) {
        this.elements.countEl.textContent = `${verifiers.length} verifiers`;
      }
      this.verifierIds = new Set(verifiers.map((v) => v.id));
      this.renderUsers(this.currentUsers || []);
    } catch (err) {
      if (this.elements.countEl) {
        this.elements.countEl.textContent = "Error loading verifiers";
      }
    }
  },

  async loadAllUsers() {
    if (!this.elements.tbody) return;
    this.elements.tbody.innerHTML = '<tr><td colspan="5" class="admin-loading">Loading users...</td></tr>';

    try {
      const search = this.elements.searchInput?.value.trim() || "";
      const users = await api.getAdminUsers(search);
      this.currentUsers = users;
      await this.loadVerifiers();
    } catch (err) {
      this.elements.tbody.innerHTML = '<tr><td colspan="5" class="admin-error">Could not load users.</td></tr>';
      this.showMessage(err.message || "Could not load users.", "error");
    }
  },

  renderUsers(users) {
    if (!this.elements.tbody) return;
    if (users.length === 0) {
      this.elements.tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No users found.</td></tr>';
      return;
    }

    this.elements.tbody.innerHTML = users
      .map((u) => {
        const isVerifier = this.verifierIds?.has(u.id);
        const isCurrentUser = u.id === this.elements.container?.dataset?.currentUserId;
        const roleLabel = u.role === "admin" ? "Admin" : u.role === "verifier" ? "Verifier" : "User";

        let actions;
        if (isCurrentUser) {
          actions = '<span class="text-xs text-gray-400">Your account</span>';
        } else if (isVerifier) {
          actions = `
            <button
              data-action="remove"
              data-user-id="${u.id}"
              data-user-name="${escapeHtml(u.name || "No name")}"
              class="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
            >
              Remove Verifier
            </button>
          `;
        } else {
          actions = `
            <button
              data-action="assign"
              data-user-id="${u.id}"
              data-user-name="${escapeHtml(u.name || "No name")}"
              class="rounded bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-hover"
            >
              Make Verifier
            </button>
          `;
        }

        const verificationStatus = u.verification_status || "pending";
        const verificationLabel =
          verificationStatus === "approved"
            ? '<span class="text-green-600">Approved</span>'
            : verificationStatus === "rejected"
            ? '<span class="text-red-600">Rejected</span>'
            : '<span class="text-yellow-600">Pending</span>';

        return `
          <tr>
            <td class="font-medium">${escapeHtml(u.name || "No name")}</td>
            <td class="text-sm text-gray-600">${escapeHtml(u.email || "")}</td>
            <td><span class="text-xs font-medium">${roleLabel}</span></td>
            <td>${verificationLabel}</td>
            <td class="text-right">${actions}</td>
          </tr>
        `;
      })
      .join("");
  },

  showMessage(text, type = "success") {
    if (!this.elements.messageEl) return;
    this.elements.messageEl.textContent = text;
    this.elements.messageEl.className = `mt-3 rounded-lg p-3 text-sm ${
      type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
    }`;
    this.elements.messageEl.classList.remove("hidden");
    setTimeout(() => this.elements.messageEl.classList.add("hidden"), 5000);
  },
};

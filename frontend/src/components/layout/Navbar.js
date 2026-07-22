import { isAdmin, isAuthenticated, getUser, logout } from "../../utils/auth.js";
import { notificationStore } from "../../state/notification.store.js";
import { api } from "../../services/api.js";

const Navbar = () => {
  const nav = document.createElement("nav");
  nav.className =
    "border-b border-border bg-background/90 px-4 py-4 backdrop-blur md:px-8";

  const authenticated = isAuthenticated();
  const user = getUser();

  const renderNotifications = (count) => {
    const badgeEl = nav.querySelector("#notif-badge");
    const dropdown = nav.querySelector("#notif-dropdown");
    if (badgeEl) {
      if (count > 0) {
        badgeEl.textContent = count > 9 ? "9+" : count;
        badgeEl.classList.remove("hidden");
      } else {
        badgeEl.classList.add("hidden");
      }
    }
    if (dropdown) {
      const notifications = notificationStore.getAll();
      if (notifications.length === 0) {
        dropdown.innerHTML = '<div class="p-4 text-center text-gray-500">No notifications</div>';
      } else {
        dropdown.innerHTML = notifications.slice(0, 10).map(n => `
          <a href="#" class="block p-3 hover:bg-gray-50 border-b border-gray-100 ${!n.is_read ? "bg-blue-50" : ""}" data-id="${n.id}">
            <p class="font-medium text-sm ${!n.is_read ? "font-bold" : ""}">${n.title}</p>
            <p class="text-xs text-gray-600 mt-1">${n.message}</p>
            <p class="text-xs text-gray-400 mt-1">${new Date(n.created_at).toLocaleString()}</p>
          </a>
        `).join("");
      }
    }
  };

  nav.innerHTML = `
    <div class="flex items-center justify-between">
      <a href="/" class="text-xl font-semibold text-primary">MUISKA</a>
      <div class="flex items-center gap-3 text-sm">
        <a href="/explore" class="rounded px-3 py-2 hover:bg-muted">Explore</a>
        ${authenticated ? `
          <a href="/create" class="rounded px-3 py-2 hover:bg-muted">Create</a>
          <a href="/dashboard" class="rounded px-3 py-2 hover:bg-muted">Dashboard</a>
          <a href="/chat" class="rounded px-3 py-2 hover:bg-muted">Messages</a>
          ${isAdmin() ? '<a href="/admin" class="rounded px-3 py-2 hover:bg-muted">Admin</a>' : ""}
          
          <!-- Notifications -->
          <div class="relative" id="notif-container">
            <button id="notif-btn" class="relative rounded-full p-2 hover:bg-gray-100 transition-colors">
              <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span id="notif-badge" class="absolute -top-1 -right-1 hidden min-h-[18px] min-w-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1">0</span>
            </button>
            <div id="notif-dropdown" class="absolute right-0 mt-2 hidden w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            </div>
          </div>

          <div class="flex items-center gap-3 border-l border-border pl-3">
            <span class="text-text/70">${user?.name || "User"}</span>
            <button id="btn-logout" class="rounded px-3 py-2 text-red-600 hover:bg-red-50">Logout</button>
          </div>
        ` : `
          <a href="/login" class="rounded px-3 py-2 hover:bg-muted">Login</a>
          <a href="/register" class="rounded px-3 py-2 bg-primary text-white hover:bg-primary-hover">Register</a>
        `}
      </div>
    </div>
  `;

  // Event listeners for navigation - handle both <a> and <button data-path>
  nav.querySelectorAll("a[href], button[data-path]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      const path = el.getAttribute("href") || el.getAttribute("data-path");
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });

  // Logout
  const logoutBtn = nav.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }

  // Notifications dropdown
  const notifBtn = nav.querySelector("#notif-btn");
  const notifDropdown = nav.querySelector("#notif-dropdown");
  const notifContainer = nav.querySelector("#notif-container");

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("hidden");
      if (!notifDropdown.classList.contains("hidden")) {
        renderNotifications(notificationStore.getUnreadCount());
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (notifContainer && !notifContainer.contains(e.target)) {
        notifDropdown.classList.add("hidden");
      }
    });

    // Click on notification
    notifDropdown.addEventListener("click", async (e) => {
      const link = e.target.closest("a[data-id]");
      if (link) {
        e.preventDefault();
        const id = link.dataset.id;
        notificationStore.markAsRead(id);
        renderNotifications(notificationStore.getUnreadCount());
        notifDropdown.classList.add("hidden");
        // TODO: Navigate based on notification type
      }
    });
  }

  // Listen for notification updates
  window.addEventListener("notifications:updated", (e) => {
    renderNotifications(e.detail.count);
  });

  // Load initial notifications
  if (authenticated) {
    notificationStore.fetchFromServer().then(() => {
      renderNotifications(notificationStore.getUnreadCount());
    });
  }

  return nav;
};

export default Navbar;
import { isAdmin, isVerifier, isAuthenticated, getUser, logout } from "../../utils/auth.js";
import { notificationStore } from "../../state/notification.store.js";
import { api } from "../../services/api.js";

const Navbar = () => {
  const nav = document.createElement("nav");
  nav.className =
    "sticky top-0 z-50 border-b border-border/60 bg-white/95 px-4 py-3 shadow-soft backdrop-blur-md md:px-8";

  const authenticated = isAuthenticated();
  const user = getUser();
  const currentPath = window.location.pathname;

  const isActive = (path) => currentPath === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        dropdown.innerHTML =
          '<div class="p-6 text-center text-text/50 text-sm">No notifications yet</div>';
      } else {
        dropdown.innerHTML = notifications
          .slice(0, 10)
          .map(
            (n) => `
          <a href="#" class="block p-4 hover:bg-muted/60 border-b border-border/40 transition-colors ${
            !n.is_read ? "bg-primary/[0.04] border-l-2 border-l-primary" : ""
          }" data-id="${n.id}">
            <p class="font-medium text-sm ${!n.is_read ? "font-semibold text-text" : "text-text/80"}">${
              n.title
            }</p>
            <p class="text-xs text-text/60 mt-0.5">${n.message}</p>
            <p class="text-xs text-text/40 mt-1">${new Date(
              n.created_at
            ).toLocaleString()}</p>
          </a>
        `
          )
          .join("");
      }
    }
  };

  const linkClass = (path) => {
    const base =
      "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200";
    if (isActive(path)) {
      return `${base} text-primary after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-primary after:rounded-full`;
    }
    return `${base} text-text/70 hover:text-text hover:bg-muted/60`;
  };

  nav.innerHTML = `
    <div class="flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-xl font-display font-bold tracking-tight text-primary">
        MUISKA
      </a>

      <!-- Desktop nav (now in hamburger menu) -->
      <div class="hidden">
        <a href="/explore" class="${linkClass("/explore")}">Explore</a>
        ${authenticated ? `
          <a href="/create" class="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create
          </a>
          <a href="/dashboard" class="${linkClass("/dashboard")}">Dashboard</a>
          <a href="/chat" class="${linkClass("/chat")}">Messages</a>
          ${isAdmin() ? `<a href="/admin" class="${linkClass("/admin")}">Admin</a>` : ""}
          ${isVerifier() ? `<a href="/verifier-dashboard" class="${linkClass("/verifier-dashboard")}">Verifier</a>` : ""}
        ` : ""}
      </div>

      <div class="flex items-center gap-2">
        ${authenticated ? `
          <!-- Notifications -->
          <div class="relative" id="notif-container">
            <button id="notif-btn" class="relative rounded-full p-2.5 text-text/60 hover:bg-muted/60 hover:text-text transition-all duration-200 active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span id="notif-badge" class="absolute -top-0.5 -right-0.5 hidden min-h-[18px] min-w-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1 shadow-sm">0</span>
            </button>
            <div id="notif-dropdown" class="absolute right-0 mt-2 hidden w-80 bg-white rounded-xl shadow-elevated border border-border/60 z-50 max-h-96 overflow-y-auto animate-scale-in origin-top-right">
            </div>
          </div>

          <!-- User dropdown -->
          <div class="relative" id="user-dropdown-container">
            <button id="user-dropdown-btn" class="flex items-center gap-2 rounded-full p-0.5 pr-3 transition-all duration-200 hover:bg-muted/60 active:scale-95 border border-border/40">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm">${getInitials(user?.name)}</div>
              <span class="hidden text-sm font-medium text-text/80 md:inline">${user?.name || "User"}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text/40"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div id="user-dropdown" class="absolute right-0 mt-2 hidden w-48 bg-white rounded-xl shadow-elevated border border-border/60 z-50 overflow-hidden animate-scale-in origin-top-right">
              <div class="px-4 py-3 border-b border-border/40">
                <p class="text-sm font-medium text-text truncate">${user?.name || "User"}</p>
                <p class="text-xs text-text/50 truncate">${user?.email || ""}</p>
              </div>
              <a href="/dashboard" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text/70 hover:bg-muted/60 hover:text-text transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Dashboard
              </a>
              <a href="/profile" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text/70 hover:bg-muted/60 hover:text-text transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </a>
              <div class="border-t border-border/40"></div>
              <button id="btn-logout" class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </div>
        ` : `
          <a href="/login" class="rounded-lg px-4 py-2 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text">Login</a>
          <a href="/register" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-hover hover:shadow-md active:scale-[0.97]">Register</a>
        `}

        <!-- Mobile hamburger -->
        <button id="mobile-menu-btn" class="flex rounded-lg p-2 text-text/60 hover:bg-muted/60 hover:text-text transition-all duration-200 active:scale-90" aria-label="Toggle menu">
          <svg id="menu-open-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg id="menu-close-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div id="mobile-menu" class="hidden mt-3 pb-3 border-t border-border/40 pt-3 animate-slide-down">
      <div class="flex flex-col gap-1">
        <a href="/explore" class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text ${isActive("/explore") ? "bg-primary/5 text-primary font-semibold" : ""}">Explore</a>
        ${authenticated ? `
          <a href="/create" class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create
          </a>
          <a href="/dashboard" class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text ${isActive("/dashboard") ? "bg-primary/5 text-primary font-semibold" : ""}">Dashboard</a>
          <a href="/chat" class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text ${isActive("/chat") ? "bg-primary/5 text-primary font-semibold" : ""}">Messages</a>
          ${isAdmin() ? `<a href="/admin" class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text ${isActive("/admin") ? "bg-primary/5 text-primary font-semibold" : ""}">Admin</a>` : ""}
          ${isVerifier() ? `<a href="/verifier-dashboard" class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text ${isActive("/verifier-dashboard") ? "bg-primary/5 text-primary font-semibold" : ""}">Verifier</a>` : ""}
          <div class="border-t border-border/40 my-2"></div>
          <a href="/profile" class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text">Profile</a>
          <button id="btn-logout-mobile" class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        ` : `
          <a href="/login" class="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-text/70 transition-colors hover:bg-muted/60 hover:text-text">Login</a>
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
  const handleLogout = () => {
    logout();
  };
  const logoutBtn = nav.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  const logoutBtnMobile = nav.querySelector("#btn-logout-mobile");
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener("click", handleLogout);
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

    document.addEventListener("click", (e) => {
      if (notifContainer && !notifContainer.contains(e.target)) {
        notifDropdown.classList.add("hidden");
      }
    });

    notifDropdown.addEventListener("click", async (e) => {
      const link = e.target.closest("a[data-id]");
      if (link) {
        e.preventDefault();
        const id = link.dataset.id;
        notificationStore.markAsRead(id);
        renderNotifications(notificationStore.getUnreadCount());
        notifDropdown.classList.add("hidden");
      }
    });
  }

  // User dropdown
  const userDropdownBtn = nav.querySelector("#user-dropdown-btn");
  const userDropdown = nav.querySelector("#user-dropdown");
  const userDropdownContainer = nav.querySelector("#user-dropdown-container");

  if (userDropdownBtn && userDropdown) {
    userDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (userDropdownContainer && !userDropdownContainer.contains(e.target)) {
        userDropdown.classList.add("hidden");
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = nav.querySelector("#mobile-menu-btn");
  const mobileMenu = nav.querySelector("#mobile-menu");
  const menuOpenIcon = nav.querySelector("#menu-open-icon");
  const menuCloseIcon = nav.querySelector("#menu-close-icon");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      menuOpenIcon.classList.toggle("hidden");
      menuCloseIcon.classList.toggle("hidden");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuOpenIcon.classList.remove("hidden");
        menuCloseIcon.classList.add("hidden");
      });
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

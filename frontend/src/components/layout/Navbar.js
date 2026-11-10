import {
  isAdmin,
  isVerifier,
  isAuthenticated,
  getUser,
  logout,
} from "../../utils/auth.js";
import { notificationStore } from "../../state/notification.store.js";

let currentApi = null;
let globalsBound = false;

function bindGlobalListeners() {
  if (globalsBound) return;
  globalsBound = true;

  document.addEventListener("click", (event) => {
    currentApi?.handleOutsideClick(event);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") currentApi?.closeAll();
  });

  window.addEventListener("notifications:updated", (event) => {
    currentApi?.renderNotifications(event.detail?.count ?? 0);
  });
}

const icon = (paths, size = 18, strokeWidth = 1.6) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${paths}</svg>`;

const ICONS = {
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  chevron: '<polyline points="6 9 12 15 18 9"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/>',
};

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Navbar = () => {
  bindGlobalListeners();

  // Si venimos de una ruta con el menú móvil abierto, liberamos el scroll.
  document.body.classList.remove("overflow-hidden");

  const nav = document.createElement("header");
  nav.className =
    "sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md";

  const authenticated = isAuthenticated();
  const user = getUser();
  const path = window.location.pathname || "/";
  const isActive = (href) => path === href || path.startsWith(`${href}/`);

  const linkClass = (href) => {
    const base =
      "relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors";
    return isActive(href)
      ? `${base} bg-primary/10 text-primary`
      : `${base} text-text/70 hover:bg-muted/70 hover:text-text`;
  };

  const dropdownItem = (href, label, iconPath) => `
    <a href="${href}" class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text/75 transition-colors hover:bg-muted/70 hover:text-text">
      <span class="text-text/40">${icon(iconPath, 16)}</span>
      ${label}
    </a>`;

  nav.innerHTML = `
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-6">
        <a href="/" class="group flex shrink-0 items-center gap-2.5" aria-label="MUISKA — Home">
          <img src="/Logo.png" alt="" width="40" height="40" class="h-9 w-9 rounded-xl object-contain" />
          <span class="font-display text-xl font-bold tracking-tight text-primary">MUISKA</span>
        </a>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Principal">
          <a href="/explore" class="${linkClass("/explore")}" ${isActive("/explore") ? 'aria-current="page"' : ""}>Explore</a>
          ${
            authenticated
              ? `
                <a href="/create" class="${linkClass("/create")}" ${isActive("/create") ? 'aria-current="page"' : ""}>Publish</a>
                <a href="/dashboard" class="${linkClass("/dashboard")}" ${isActive("/dashboard") ? 'aria-current="page"' : ""}>Dashboard</a>
                <a href="/chat" class="${linkClass("/chat")}" ${isActive("/chat") ? 'aria-current="page"' : ""}>Messages</a>
              `
              : ""
          }
        </nav>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2">
        ${
          authenticated
            ? `
              <a href="/create" class="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98] md:inline-flex">
                ${icon(ICONS.plus, 16, 2.2)}
                Publish
              </a>

              <div class="relative" id="notif-container">
                <button id="notif-btn" type="button" class="relative rounded-full p-2.5 text-text/60 transition-colors hover:bg-muted/70 hover:text-text" aria-label="Notifications" aria-haspopup="true" aria-expanded="false">
                  ${icon(ICONS.bell, 20)}
                  <span id="notif-badge" class="absolute -top-0.5 -right-0.5 hidden min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-sm">0</span>
                </button>
                <div id="notif-dropdown" class="absolute right-0 z-50 mt-2 hidden max-h-96 w-80 overflow-y-auto rounded-2xl border border-border/70 bg-white shadow-elevated"></div>
              </div>

              <div class="relative" id="user-dropdown-container">
                <button id="user-dropdown-btn" type="button" class="flex items-center gap-2 rounded-full border border-border/60 p-0.5 pr-2.5 transition-colors hover:bg-muted/60" aria-haspopup="true" aria-expanded="false">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">${getInitials(user?.name)}</span>
                  <span class="hidden max-w-[9rem] truncate text-sm font-medium text-text/80 sm:inline">${user?.name || "Account"}</span>
                  <span class="text-text/40">${icon(ICONS.chevron, 14, 2)}</span>
                </button>
                <div id="user-dropdown" class="absolute right-0 z-50 mt-2 hidden w-56 overflow-hidden rounded-2xl border border-border/70 bg-white shadow-elevated">
                  <div class="border-b border-border/50 px-4 py-3">
                    <p class="truncate text-sm font-semibold text-text">${user?.name || "Account"}</p>
                    <p class="truncate text-xs text-text/50">${user?.email || ""}</p>
                  </div>
                  ${dropdownItem("/dashboard", "Dashboard", ICONS.grid)}
                  ${dropdownItem("/profile", "Profile", ICONS.user)}
                  ${isAdmin() ? dropdownItem("/admin", "Admin panel", ICONS.shield) : ""}
                  ${isVerifier() ? dropdownItem("/verifier-dashboard", "Verifier panel", ICONS.shield) : ""}
                  <div class="border-t border-border/50"></div>
                  <button id="btn-logout" type="button" class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 transition-colors hover:bg-red-50">
                    <span class="text-red-500/70">${icon(ICONS.logout, 16)}</span>
                    Log out
                  </button>
                </div>
              </div>
            `
            : `
              <a href="/login" class="hidden rounded-full px-4 py-2 text-sm font-medium text-text/70 transition-colors hover:bg-muted/70 hover:text-text sm:inline-flex">Log in</a>
              <a href="/register" class="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.98] sm:inline-flex">
                Join free
              </a>
            `
        }

        <button id="mobile-menu-btn" type="button" class="inline-flex rounded-full p-2.5 text-text/70 transition-colors hover:bg-muted/70 hover:text-text md:hidden" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">
          <span id="menu-open-icon">${icon(ICONS.menu, 22, 2)}</span>
          <span id="menu-close-icon" class="hidden">${icon(ICONS.close, 22, 2)}</span>
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="hidden border-t border-border/60 bg-background px-4 pb-5 pt-3 md:hidden">
      <nav class="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Menú móvil">
        <a href="/explore" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/explore") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Explore</a>
        ${
          authenticated
            ? `
              <a href="/create" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/create") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Publish</a>
              <a href="/dashboard" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/dashboard") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Dashboard</a>
              <a href="/chat" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/chat") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Messages</a>
              <a href="/profile" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/profile") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Profile</a>
              ${isAdmin() ? `<a href="/admin" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/admin") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Admin panel</a>` : ""}
              ${isVerifier() ? `<a href="/verifier-dashboard" class="rounded-xl px-3 py-2.5 text-sm font-medium ${isActive("/verifier-dashboard") ? "bg-primary/10 text-primary" : "text-text/75 hover:bg-muted/70"}">Verifier panel</a>` : ""}
              <div class="my-2 border-t border-border/60"></div>
              <button id="btn-logout-mobile" type="button" class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50">
                ${icon(ICONS.logout, 16)}
                Log out
              </button>
            `
            : `
              <div class="my-2 border-t border-border/60"></div>
              <a href="/login" class="rounded-xl px-3 py-2.5 text-sm font-medium text-text/75 hover:bg-muted/70">Log in</a>
              <a href="/register" class="mt-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">Join free</a>
            `
        }
      </nav>
    </div>
  `;

  const notifBtn = nav.querySelector("#notif-btn");
  const notifDropdown = nav.querySelector("#notif-dropdown");
  const userBtn = nav.querySelector("#user-dropdown-btn");
  const userDropdown = nav.querySelector("#user-dropdown");
  const mobileBtn = nav.querySelector("#mobile-menu-btn");
  const mobileMenu = nav.querySelector("#mobile-menu");
  const openIcon = nav.querySelector("#menu-open-icon");
  const closeIcon = nav.querySelector("#menu-close-icon");

  const renderNotifications = (count) => {
    const badge = nav.querySelector("#notif-badge");
    if (!badge) return;

    if (count > 0) {
      badge.textContent = count > 9 ? "9+" : count;
      badge.classList.remove("hidden");
      badge.classList.add("flex");
    } else {
      badge.classList.add("hidden");
      badge.classList.remove("flex");
    }

    if (!notifDropdown) return;

    const notifications = notificationStore.getAll();
    if (notifications.length === 0) {
      notifDropdown.innerHTML = `
        <div class="px-5 py-8 text-center">
          <p class="text-sm font-medium text-text">You're all caught up</p>
          <p class="mt-1 text-xs text-text/60">New activity will appear here.</p>
        </div>`;
      return;
    }

    notifDropdown.innerHTML = `
      <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <p class="text-sm font-semibold text-text">Notifications</p>
        <button type="button" id="notif-read-all" class="text-xs font-medium text-primary hover:text-primary-hover">Mark all read</button>
      </div>
      ${notifications
        .slice(0, 10)
        .map(
          (n) => `
        <a href="#" data-id="${n.id}" class="block border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-muted/50 ${
          !n.is_read ? "border-l-2 border-l-primary bg-primary/[0.04]" : ""
        }">
          <p class="text-sm ${!n.is_read ? "font-semibold text-text" : "text-text/80"}">${n.title}</p>
          <p class="mt-0.5 text-xs text-text/60">${n.message}</p>
          <p class="mt-1 text-[11px] text-text/40">${new Date(n.created_at).toLocaleString()}</p>
        </a>`,
        )
        .join("")}
    `;

    notifDropdown.querySelector("#notif-read-all")?.addEventListener("click", async (event) => {
      event.stopPropagation();
      await notificationStore.markAllAsRead();
      renderNotifications(notificationStore.getUnreadCount());
    });
  };

  const closeAll = () => {
    notifDropdown?.classList.add("hidden");
    userDropdown?.classList.add("hidden");
    notifBtn?.setAttribute("aria-expanded", "false");
    userBtn?.setAttribute("aria-expanded", "false");
    mobileMenu?.classList.add("hidden");
    mobileBtn?.setAttribute("aria-expanded", "false");
    openIcon?.classList.remove("hidden");
    closeIcon?.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  };

  const handleOutsideClick = (event) => {
    if (!nav.isConnected) return;
    if (!nav.querySelector("#notif-container")?.contains(event.target)) {
      notifDropdown?.classList.add("hidden");
      notifBtn?.setAttribute("aria-expanded", "false");
    }
    if (!nav.querySelector("#user-dropdown-container")?.contains(event.target)) {
      userDropdown?.classList.add("hidden");
      userBtn?.setAttribute("aria-expanded", "false");
    }
    if (
      !mobileMenu?.contains(event.target) &&
      !mobileBtn?.contains(event.target) &&
      mobileMenu &&
      !mobileMenu.classList.contains("hidden")
    ) {
      closeAll();
    }
  };

  currentApi = { handleOutsideClick, closeAll, renderNotifications };

  notifBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = notifDropdown.classList.contains("hidden");
    userDropdown?.classList.add("hidden");
    userBtn?.setAttribute("aria-expanded", "false");
    notifDropdown.classList.toggle("hidden");
    notifBtn.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) renderNotifications(notificationStore.getUnreadCount());
  });

  notifDropdown?.addEventListener("click", async (event) => {
    const link = event.target.closest("a[data-id]");
    if (!link) return;
    event.preventDefault();
    await notificationStore.markAsRead(link.dataset.id);
    renderNotifications(notificationStore.getUnreadCount());
    notifDropdown.classList.add("hidden");
    notifBtn?.setAttribute("aria-expanded", "false");
  });

  userBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = userDropdown.classList.contains("hidden");
    notifDropdown?.classList.add("hidden");
    notifBtn?.setAttribute("aria-expanded", "false");
    userDropdown.classList.toggle("hidden");
    userBtn.setAttribute("aria-expanded", String(willOpen));
  });

  nav.querySelector("#btn-logout")?.addEventListener("click", logout);
  nav.querySelector("#btn-logout-mobile")?.addEventListener("click", logout);

  mobileBtn?.addEventListener("click", () => {
    const willOpen = mobileMenu.classList.contains("hidden");
    mobileMenu.classList.toggle("hidden");
    openIcon.classList.toggle("hidden", willOpen);
    closeIcon.classList.toggle("hidden", !willOpen);
    mobileBtn.setAttribute("aria-expanded", String(willOpen));
    mobileBtn.setAttribute("aria-label", willOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("overflow-hidden", willOpen);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeAll());
  });

  if (authenticated) {
    notificationStore.fetchFromServer().then(() => {
      renderNotifications(notificationStore.getUnreadCount());
    });
  }

  return nav;
};

export default Navbar;

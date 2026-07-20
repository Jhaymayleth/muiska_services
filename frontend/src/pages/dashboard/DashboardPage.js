import { navigateTo } from "../../router/router.js";
import { getUser, sessionStore } from "../../utils/auth.js";
import { getFavorites } from "../../services/publication.service.js";
import { api } from "../../services/api.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { formatDate } from "../../utils/helpers.js";

const DashboardPage = async () => {
  const template = loadTemplate("DashboardPage");
  const section = document.createElement("section");
  section.className = "space-y-6";

  const user = getUser() || {};

  // Leer URL para determinar qué tab mostrar
  const path = window.location.pathname;
  let activeTab = path === "/dashboard/favoritos" ? "favorites" : "publications";

  const userInitials = user.name
    ? user.name.trim().split(/\s+/).map(n => n[0]).slice(0,2).join("").toUpperCase()
    : "US";
  const userName = user.name || "Usuario";
  const userEmail = user.email || "";
  const userRole = user.role || "user";
  const userSince = formatDate(user.created_at);
  const adminButton = user.role === "admin" 
    ? '<a href="/admin" id="btn-admin" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">Panel admin</a>' 
    : "";

  section.innerHTML = template
    .replace("{{userInitials}}", userInitials)
    .replace("{{userName}}", userName)
    .replace("{{userEmail}}", userEmail)
    .replace("{{userRole}}", userRole)
    .replace("{{userSince}}", userSince)
    .replace("{{adminButton}}", adminButton);

  // Load component templates
  const statsTemplate = loadTemplate("DashboardStats");
  const pubCardTemplate = loadTemplate("DashboardPubCard");
  const favCardTemplate = loadTemplate("DashboardFavCard");
  const pubEmptyTemplate = loadTemplate("DashboardPubEmpty");
  const favEmptyTemplate = loadTemplate("DashboardFavEmpty");
  const favStatsTemplate = loadTemplate("DashboardFavStats");

  // DOM elements
  const stats = section.querySelector("#dashboard-stats");
  const list = section.querySelector("#dashboard-list");
  const favList = section.querySelector("#favorites-list");
  const favStats = section.querySelector("#favorites-stats");

  const tabPublications = section.querySelector("#tab-publications");
  const tabFavorites = section.querySelector("#tab-favorites");
  const publicationsSection = section.querySelector("#publications-section");
  const favoritesSection = section.querySelector("#favorites-section");

  // Render stats for publications
  const renderStats = (pubs) => {
    const total = pubs.length;
    const active = pubs.filter((p) => p.status === "active").length;
    const sold = pubs.filter((p) => p.status === "sold").length;

    stats.innerHTML = statsTemplate
      .replace("{{total}}", total)
      .replace("{{active}}", active)
      .replace("{{sold}}", sold);
  };

  const renderPubList = async () => {
    list.innerHTML = '<p class="text-sm text-text/70">Cargando...</p>';

    try {
      const pubs = await api.getMyPublications();
      renderStats(pubs);

      if (pubs.length === 0) {
        list.innerHTML = pubEmptyTemplate;
        return;
      }

      list.innerHTML = pubs.map((pub) => {
        const statusBadge = pub.status === "active"
          ? '<span class="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">Activa</span>'
          : '<span class="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-text/70">Inactiva</span>';

        return pubCardTemplate
          .replace("{{title}}", pub.title)
          .replace("{{price}}", parseFloat(pub.price).toFixed(2))
          .replace("{{category}}", pub.category || "")
          .replace("{{statusBadge}}", statusBadge)
          .replace("{{id}}", pub.id);
      }).join("");

      // Add event listeners
      list.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => navigateTo(`/editar-publicacion/${btn.dataset.id}`));
      });
      list.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (confirm("¿Eliminar esta publicación?")) {
            try {
              await api.deletePublication(btn.dataset.id);
              renderPubList();
            } catch (err) {
              alert(err.message);
            }
          }
        });
      });
    } catch (err) {
      list.innerHTML = `<p class="text-sm text-red-600">${err.message || "No se pudieron cargar las publicaciones."}</p>`;
    }
  };

  const renderFavList = async () => {
    favList.innerHTML = '<p class="text-sm text-text/70">Cargando...</p>';
    favStats.innerHTML = "";

    try {
      const result = await getFavorites({ page: 1, limit: 12 });
      const favs = result.data || [];

      if (favs.length === 0) {
        favList.innerHTML = favEmptyTemplate;
        return;
      }

      // Stats
      favStats.innerHTML = favStatsTemplate
        .replace("{{total}}", favs.length)
        .replace("{{active}}", favs.filter(p => p.status === "active").length)
        .replace("{{inactive}}", favs.filter(p => p.status === "sold" || p.status === "inactive").length);

      favList.innerHTML = favs.map((pub) => {
        const statusBadge = pub.status === "active"
          ? '<span class="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">Activa</span>'
          : '<span class="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-text/70">Inactiva</span>';

        return favCardTemplate
          .replace("{{id}}", pub.id)
          .replace("{{title}}", pub.title)
          .replace("{{price}}", parseFloat(pub.price).toFixed(2))
          .replace("{{category}}", pub.category || "")
          .replace("{{statusBadge}}", statusBadge)
          .replace("{{userName}}", pub.user_name || "Usuario")
          .replace("{{hasImage}}", pub.images && pub.images.length > 0 ? "true" : "false")
          .replace("{{image}}", pub.images?.[0] || "")
          .replace("{{title}}", pub.title);
      }).join("");

      // Add unfavorite listeners
      favList.querySelectorAll(".unfav-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (confirm("¿Quitar de favoritos?")) {
            try {
              await api.request(`/favorites/${btn.dataset.id}/toggle`, { method: "POST" });
              renderFavList();
            } catch (err) {
              alert(err.message);
            }
          }
        });
      });
    } catch (err) {
      favList.innerHTML = `<p class="text-sm text-red-600">${err.message || "No se pudieron cargar los favoritos."}</p>`;
    }
  };

  const switchTab = (tab) => {
    activeTab = tab;
    if (tab === "publications") {
      tabPublications.classList.add("bg-primary", "text-white");
      tabPublications.classList.remove("text-text/70", "hover:bg-muted");
      tabFavorites.classList.remove("bg-primary", "text-white");
      tabFavorites.classList.add("text-text/70", "hover:bg-muted");
      publicationsSection.classList.remove("hidden");
      favoritesSection.classList.add("hidden");
      renderPubList();
    } else {
      tabFavorites.classList.add("bg-primary", "text-white");
      tabFavorites.classList.remove("text-text/70", "hover:bg-muted");
      tabPublications.classList.remove("bg-primary", "text-white");
      tabPublications.classList.add("text-text/70", "hover:bg-muted");
      favoritesSection.classList.remove("hidden");
      publicationsSection.classList.add("hidden");
      renderFavList();
    }
  };

  section.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    });
  });

  tabPublications.addEventListener("click", () => switchTab("publications"));
  tabFavorites.addEventListener("click", () => switchTab("favorites"));

  // Initial load basado en la URL
  if (activeTab === "favorites") {
    switchTab("favorites");
  } else {
    renderPubList();
  }

  return section;
};

export default DashboardPage;
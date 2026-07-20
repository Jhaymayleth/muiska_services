import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";
import womanImg from "../assets/images/Woman.jpg";
import vestidorImg from "../assets/images/vestidor.jpg";

const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Sin fecha";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const statusLabel = (status) => {
  const labels = { active: "Venta", sold: "Vendido", inactive: "Inactivo" };
  return labels[status] || status;
};

const statusClass = (status) => {
  const classes = {
    active: "bg-primary text-background",
    sold: "bg-accent text-background",
    inactive: "bg-text text-background",
  };
  return classes[status] || "bg-muted text-text";
};

const categoryIcons = {
  "ropa": "👗", "moda": "👗", "ropa & moda": "👗",
  "comida": "🍽️", "alimentos": "🍽️",
  "tecnología": "💻", "tecnologia": "💻",
  "hogar": "🏠", "casa": "🏠",
  "arte": "🎨", "artesanía": "🎨",
  "salud": "🧑‍⚕️", "bienestar": "🧑‍⚕️",
  "educación": "📚", "educacion": "📚",
  "servicios": "🔧", "servicio": "🔧",
};

const getCategoryIcon = (name) => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon;
  }
  return "📦";
};

const HomePage = async () => {
  const template = loadTemplate("HomePage");
  const page = document.createElement("div");
  page.className = "flex flex-col";
  page.innerHTML = template.replace("{{womanImg}}", womanImg);

  const categoriesContainer = page.querySelector("#categories-container");
  const featuredContainer = page.querySelector("#featured-container");

  const renderCategoryLoader = () => {
    categoriesContainer.innerHTML = `
      <div class="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${Array.from({ length: 4 })
          .map(
            () => `
            <div class="rounded-2xl border border-border bg-background px-5 py-6 animate-pulse">
              <div class="h-10 w-10 rounded-full bg-muted mb-5"></div>
              <div class="h-5 rounded-full bg-muted mb-3"></div>
              <div class="h-4 w-3/4 rounded-full bg-muted"></div>
            </div>
          `,
          )
          .join("")}
      </div>
    `;
  };

  const renderFeaturedLoader = () => {
    featuredContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${Array.from({ length: 3 })
          .map(
            () => `
            <div class="rounded-2xl border border-border bg-background p-6 animate-pulse">
              <div class="h-48 w-full rounded-2xl bg-muted mb-4"></div>
              <div class="h-5 rounded-full bg-muted mb-3"></div>
              <div class="h-4 rounded-full bg-muted mb-2"></div>
              <div class="h-4 w-3/4 rounded-full bg-muted"></div>
            </div>
          `,
          )
          .join("")}
      </div>
    `;
  };

  const loadCategories = async () => {
    renderCategoryLoader();
    try {
      const categories = await api.getCategories();
      if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p class="col-span-full text-center text-sm text-text/60">No hay categorías disponibles.</p>';
        return;
      }
      categoriesContainer.innerHTML = categories
        .slice(0, 8)
        .map(
          (cat) => `
            <a href="/explorar?category=${encodeURIComponent(cat.name)}" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-200 hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer">
              <span class="text-3xl">${getCategoryIcon(cat.name)}</span>
              <h3 class="font-medium text-text">${cat.name}</h3>
            </a>
          `
        )
        .join("");
    } catch (err) {
      categoriesContainer.innerHTML = '<p class="col-span-full text-center text-sm text-red-600">Error al cargar categorías.</p>';
    }
  };

  const createPublicationCard = (pub) => {
    const initials = getInitials(pub.user?.name || pub.user_name || "Usuario");
    const userBg = pub.user?.name ? "bg-primary" : "bg-muted";
    const typeLabel = statusLabel(pub.status || "active");
    const typeClass = statusClass(pub.status || "active");
    const image = pub.images?.[0] || vestidorImg;

    return `
      <div class="Publicacion flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden">
        <div class="relative">
          <img src="${image}" alt="${pub.title}" class="w-full h-56 object-cover" />
          <span class="absolute top-3 left-3 ${typeClass} text-xs font-medium px-3 py-1 rounded-full">${typeLabel}</span>
          <input type="checkbox" id="like-${pub.id}" class="peer hidden" />
          <label for="like-${pub.id}" class="like-btn absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full cursor-pointer text-text/40 peer-checked:text-primary transition-transform duration-200 active:scale-75">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5 transition-transform duration-200 peer-checked:scale-125" fill="currentColor">
              <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.1-1 4.4-.3 5.7 1.4l1.7 2.1 1.7-2.1c1.3-1.7 3.6-2.4 5.7-1.4 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
            </svg>
          </label>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <h3 class="font-medium text-text text-lg mb-1">${pub.title}</h3>
          <p class="text-text/60 text-sm mb-4">${pub.description?.slice(0, 100) || ""}${pub.description?.length > 100 ? "..." : ""}</p>
          <div class="flex items-center justify-between text-sm text-text/60 border-b border-border pb-3 mb-3">
            <span class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor">
                <path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.6.2.2.5.2.7 0C12.3 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
              </svg>
              ${pub.location || "Sin ubicación"}
            </span>
            <span>${formatDate(pub.created_at)}</span>
          </div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full ${userBg} flex items-center justify-center shrink-0">
                <span class="text-background text-xs font-bold">${initials}</span>
              </div>
              <span class="text-sm text-text">${pub.user?.name || pub.user_name || "Usuario"}</span>
            </div>
            <span class="font-bold text-primary">$${Number(pub.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <button class="w-full mt-auto bg-primary hover:bg-primary-hover text-background font-medium py-2 rounded-full" data-pub-id="${pub.id}">Contactar</button>
        </div>
      </div>
    `;
  };

  const loadFeatured = async () => {
    renderFeaturedLoader();
    try {
      const response = await api.getPublications({ status: "active", limit: 6, page: 1 });
      const pubs = response.data || [];

      if (pubs.length === 0) {
        featuredContainer.innerHTML = `
          <div class="col-span-full rounded-xl border border-dashed border-border bg-background p-8 text-center">
            <h3 class="text-lg font-semibold">No hay publicaciones destacadas</h3>
            <p class="mt-2 text-sm text-text/70">Sé el primero en crear una.</p>
          </div>`;
        return;
      }

      featuredContainer.innerHTML = pubs.map(createPublicationCard).join("");

      featuredContainer.querySelectorAll("button[data-pub-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          navigateTo(`/publicacion/${btn.dataset.pubId}`);
        });
      });
    } catch (err) {
      featuredContainer.innerHTML = `
        <div class="col-span-full rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
          <p class="text-red-600">${err.message || "Error al cargar publicaciones"}</p>
        </div>`;
    }
  };

  page.querySelectorAll("[data-path]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigate(btn.dataset.path);
    });
  });

  page.querySelectorAll("a[href^='/']").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.getAttribute("href"));
    });
  });

  loadCategories();
  loadFeatured();

  return page;
};

export default HomePage;
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

  const categoryLoaderTemplate = loadTemplate("CategorySkeleton");
  const featuredLoaderTemplate = loadTemplate("FeaturedSkeleton");
  const publicationCardTemplate = loadTemplate("PublicationCard");

  const renderCategoryLoader = () => {
    categoriesContainer.innerHTML = categoryLoaderTemplate;
  };

  const renderFeaturedLoader = () => {
    featuredContainer.innerHTML = featuredLoaderTemplate;
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

    return publicationCardTemplate
      .replace("{{id}}", pub.id)
      .replace("{{image}}", image)
      .replace("{{title}}", pub.title)
      .replace("{{description}}", pub.description?.slice(0, 100) || "")
      .replace("{{descriptionMore}}", pub.description?.length > 100 ? "..." : "")
      .replace("{{location}}", pub.location || "Sin ubicación")
      .replace("{{date}}", formatDate(pub.created_at))
      .replace("{{initials}}", initials)
      .replace("{{userBg}}", userBg)
      .replace("{{author}}", pub.user?.name || pub.user_name || "Usuario")
      .replace("{{price}}", Number(pub.price || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      .replace("{{statusLabel}}", typeLabel)
      .replace("{{statusClass}}", typeClass);
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
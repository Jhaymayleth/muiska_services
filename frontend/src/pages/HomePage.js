import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";

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

const HomePage = () => {
  const page = document.createElement("div");
  page.className = "flex flex-col";

  page.innerHTML = `
    <!-- Header -->
    <header class="sticky top-0 z-50 w-full bg-background border-b border-border text-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-3">
        <a href="/" class="flex items-center gap-2 shrink-0" id="logo-link">
          <span class="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-background font-display font-bold">M</span>
          <span class="font-display text-xl font-bold text-text">Muiska</span>
        </a>

        <input type="checkbox" id="menu-toggle" class="peer hidden" />
        <label for="menu-toggle" class="lg:hidden text-text text-2xl cursor-pointer">&#9776;</label>

        <nav class="hidden peer-checked:flex lg:flex flex-col lg:flex-row absolute lg:static top-full left-0 w-full lg:w-auto bg-background lg:bg-transparent border-b lg:border-0 border-border px-6 lg:px-0 py-4 lg:py-0 gap-4 lg:gap-6 items-center lg:flex-1 lg:justify-center">
          <ul class="flex flex-col lg:flex-row items-center gap-1 w-full lg:w-auto">
            <li class="w-full lg:w-auto"><a href="#Inicio" class="block text-center lg:inline px-4 py-2 rounded-full bg-muted text-primary font-medium">Inicio</a></li>
            <li class="w-full lg:w-auto"><a href="#Categorias" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Categorías</a></li>
            <li class="w-full lg:w-auto"><a href="#Publicacion" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Publicación</a></li>
            <li class="w-full lg:w-auto"><a href="#Comofunciona" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">¿Cómo funciona?</a></li>
            <li class="w-full lg:w-auto"><a href="#Nosotros" class="block text-center lg:inline px-4 py-2 text-text/70 hover:text-text font-medium">Nosotros</a></li>
          </ul>
          <div class="flex items-center gap-2 w-full lg:w-auto">
            <input type="text" placeholder="Buscar..." class="bg-muted text-text placeholder-text/50 rounded-full px-4 py-2 border border-border flex-1 lg:flex-none" />
            <button class="Search bg-accent hover:opacity-90 text-background font-medium px-4 py-2 rounded-full shrink-0">Buscar</button>
          </div>
          <div class="flex items-center gap-4 lg:hidden w-full justify-center pt-2">
            <button class="Login text-text/70 hover:text-text font-medium" data-path="/login">Iniciar sesión</button>
            <button class="Register bg-primary hover:bg-primary-hover text-background font-medium px-5 py-2.5 rounded-full" data-path="/registro">Registrarse</button>
          </div>
        </nav>

        <div class="hidden lg:flex items-center gap-4 shrink-0">
          <button class="Login text-text/70 hover:text-text font-medium" data-path="/login">Iniciar sesión</button>
          <button class="Register bg-primary hover:bg-primary-hover text-background font-medium px-5 py-2.5 rounded-full" data-path="/registro">Registrarse</button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section id="Inicio" class="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 xl:py-40 overflow-hidden">
      <img src="/Woman.jpg" alt="Emprendedora colombiana trabajando en su taller" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-background/85"></div>
      <div class="relative max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col items-center text-center">
        <a class="inline-flex items-center gap-2 bg-muted border border-border rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm text-text/70 mb-8 sm:mb-10 hover:border-primary transition">Plataforma de intercambio comunitario</a>
        <h1 class="font-display font-bold leading-none mb-8 sm:mb-10">
          <span class="block text-text text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">Conecta.</span>
          <span class="block text-primary text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">Comparte.</span>
          <span class="block text-text text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">Crece.</span>
        </h1>
        <p class="text-base sm:text-lg lg:text-xl text-text/70 max-w-md sm:max-w-2xl mb-8 sm:mb-10">El mercado comunitario donde emprendedores y personas del día a día intercambian bienes, servicios y donaciones con facilidad.</p>
        <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a href="/explorar" class="w-full sm:w-auto text-center bg-primary hover:bg-primary-hover text-background font-medium px-6 py-3 lg:px-8 lg:py-4 lg:text-lg rounded-full" id="hero-explorar">Explorar ahora &rarr;</a>
          <a href="/registro" class="w-full sm:w-auto text-center bg-background hover:bg-muted border border-border text-text font-medium px-6 py-3 lg:px-8 lg:py-4 lg:text-lg rounded-full transition" id="hero-registro">Crear cuenta gratis</a>
        </div>
      </div>
    </section>

    <!-- Categorías (dinámicas) -->
    <section id="Categorias" class="bg-background px-6 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="font-display text-4xl font-bold text-text mb-2">Categorías</h2>
            <p class="text-text/60">Explora nuestras categorías principales.</p>
          </div>
          <a href="/explorar" class="text-primary font-medium flex items-center gap-1 hover:text-primary-hover transition" id="cat-ver-todo">Ver todo &rarr;</a>
        </div>
        <div class="categories grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="categories-container">
          <div class="col-span-full flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Publicaciones destacadas (dinámicas) -->
    <section id="Publicacion" class="bg-muted px-6 py-20">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h2 class="font-display text-4xl font-bold text-text mb-2">Publicaciones destacadas</h2>
            <p class="text-text/60">Nuestra selección de publicaciones más recientes.</p>
          </div>
          <a href="/explorar" class="text-primary font-medium flex items-center gap-1 hover:text-primary-hover transition" id="pub-ver-mas">Ver más &rarr;</a>
        </div>
        <div class="Publicaciones grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="featured-container">
          <div class="col-span-full flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cómo funciona -->
    <section id="Comofunciona" class="bg-background px-6 py-24">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="font-display text-4xl font-bold text-text mb-3">¿Cómo funciona?</h2>
        <p class="text-text/60 mb-14">Simple y sin complicaciones.</p>
        <div class="steps grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div class="step bg-background border border-border rounded-2xl px-8 py-10">
            <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted rounded-2xl text-3xl">👤</div>
            <span class="text-primary font-bold text-sm">01</span>
            <h3 class="font-bold text-text text-xl mt-2 mb-3">Regístrate gratis</h3>
            <p class="text-text/60">Crea tu cuenta en segundos y configura tu perfil de vendedor o comprador.</p>
          </div>
          <div class="step bg-background border border-border rounded-2xl px-8 py-10">
            <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted rounded-2xl text-3xl">🔍</div>
            <span class="text-primary font-bold text-sm">02</span>
            <h3 class="font-bold text-text text-xl mt-2 mb-3">Publica o explora</h3>
            <p class="text-text/60">Sube tus productos, servicios o donaciones, o encuentra lo que necesitas.</p>
          </div>
          <div class="step bg-background border border-border rounded-2xl px-8 py-10">
            <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-muted rounded-2xl text-3xl">🤝</div>
            <span class="text-primary font-bold text-sm">03</span>
            <h3 class="font-bold text-text text-xl mt-2 mb-3">Conecta y cierra</h3>
            <p class="text-text/60">Habla directamente con el vendedor, acuerden los detalles y listo.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section id="CTA" class="bg-primary px-10 py-24">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="font-display text-4xl font-bold text-background mb-4">¡Únete a la comunidad!</h2>
        <p class="text-background/80 mb-10">Miles de emprendedores ya intercambian en MUISKA.</p>
        <a href="/registro" class="inline-block bg-background hover:bg-muted text-primary font-bold px-8 py-4 rounded-full transition" id="cta-registro">Crear cuenta gratis &rarr;</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-text px-6 py-8">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <a href="/" class="flex items-center gap-3 shrink-0">
          <span class="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-background font-display font-bold">M</span>
          <span class="font-display text-xl font-bold text-background">MUISKA</span>
        </a>
        <p class="text-background/60 text-sm text-center">&copy; 2024 MUISKA Community Commerce. Todos los derechos reservados.</p>
        <nav class="flex items-center gap-6">
          <a href="#" class="text-background/70 hover:text-background text-sm transition">Términos</a>
          <a href="#" class="text-background/70 hover:text-background text-sm transition">Privacidad</a>
          <a href="#" class="text-background/70 hover:text-background text-sm transition">Ayuda</a>
        </nav>
      </div>
    </footer>
  `;

  const categoriesContainer = page.querySelector("#categories-container");
  const featuredContainer = page.querySelector("#featured-container");

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
    const image = pub.images?.[0] || "/vestidor.jpg";

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
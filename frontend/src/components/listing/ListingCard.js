import { navigateTo } from "../../router/router.js";
import { toggleFavorite, checkFavorite } from "../../services/publication.service.js";
import { isAuthenticated } from "../../utils/auth.js";

const ListingCard = (pub = {}) => {
  const card = document.createElement("article");
  card.className =
    "rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer relative";
  
  // Verificar si está en favoritos al cargar
  let isFavorited = false;
  
  const checkFavStatus = async () => {
    if (isAuthenticated() && pub.id) {
      try {
        const result = await checkFavorite(pub.id);
        isFavorited = result.favorited;
        renderHeart();
      } catch (e) {
        console.warn("Error checking favorite:", e);
      }
    }
  };
  
  // Renderizar el botón de corazón
  const renderHeart = () => {
    const heartBtn = card.querySelector(".favorite-btn");
    if (heartBtn) {
      heartBtn.innerHTML = isFavorited
        ? `<svg class="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
        : `<svg class="w-5 h-5 text-text/40 hover:text-red-500 transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      heartBtn.setAttribute("aria-label", isFavorited ? "Remove from favorites" : "Add to favorites");
      heartBtn.classList.toggle("favorited", isFavorited);
    }
  };

  card.innerHTML = `
    <button class="favorite-btn absolute top-3 right-3 p-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Add to favorites" title="Add to favorites">
      <svg class="w-5 h-5 text-text/40 hover:text-red-500 transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </button>
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h4 class="font-semibold text-primary">${pub.title || "No title"}</h4>
          <p class="mt-1 text-xs uppercase tracking-wide text-text/50">${pub.category || "No category"}</p>
        </div>
        <span class="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">$${pub.price ? parseFloat(pub.price).toFixed(2) : "0.00"}</span>
      </div>
      <p class="line-clamp-3 text-sm text-text/70">${pub.description || "No description"}</p>
      <div class="flex flex-wrap gap-2 text-xs text-text/60">
        ${pub.location ? `<span class="rounded-full bg-muted px-2 py-1">📍 ${pub.location}</span>` : ""}
        ${pub.contact_method ? `<span class="rounded-full bg-muted px-2 py-1">📞 ${pub.contact_method}</span>` : ""}
      </div>
      ${
        Array.isArray(pub.images) && pub.images.length > 0
          ? `<div class="flex gap-2 overflow-x-auto">${pub.images
              .slice(0, 3)
              .map(
                (image) =>
                  `<img src="${image}" alt="${pub.title || "Image"}" class="h-20 w-20 rounded-lg object-cover" />`,
              )
              .join("")}</div>`
          : ""
      }
    </div>
  `;

  // Botón de favorito
  const favoriteBtn = card.querySelector(".favorite-btn");
  favoriteBtn.addEventListener("click", async (e) => {
    e.stopPropagation(); // Evitar navegación
    e.preventDefault();
    
    if (!isAuthenticated()) {
      navigateTo("/login");
      return;
    }
    
    if (!pub.id) return;
    
    try {
      const result = await toggleFavorite(pub.id);
      isFavorited = result.favorited;
      renderHeart();
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert(err.message || "Error updating favorite");
    }
  });

  // Navegar al hacer click en la tarjeta (excepto botón favorito)
  card.addEventListener("click", (e) => {
    if (e.target.closest(".favorite-btn")) return;
    navigateTo(`/listing/${pub.id}`);
  });

  // Verificar estado inicial
  checkFavStatus();

  return card;
};

export default ListingCard;
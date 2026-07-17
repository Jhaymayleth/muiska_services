// ListingCard - Tarjeta simple para listar publicaciones
import { navigateTo } from "../../router/router.js";

const ListingCard = (pub = {}) => {
  const card = document.createElement("article");
  card.className = "flex flex-col h-full bg-white border border-border rounded-2xl overflow-hidden";

  const images = Array.isArray(pub.images) && pub.images.length > 0 ? pub.images : [];
  const statusText = { active: "Activa", sold: "Vendida", inactive: "Inactiva" };
  const statusClass = { active: "bg-green-100 text-green-700", sold: "bg-blue-100 text-blue-700", inactive: "bg-gray-100 text-gray-700" };
  const sc = statusClass[pub.status] || "bg-gray-100 text-gray-700";

  card.innerHTML = `
    <div class="relative">
      ${images.length > 0 ? `
        <img src="${images[0]}" alt="${pub.title}" class="w-full h-56 object-cover">
      ` : `
        <div class="w-full h-56 bg-muted/30 flex items-center justify-center">
          <svg class="w-16 h-16 text-text/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      `}
      <span class="absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded-full ${pub.status === "active" ? "bg-primary text-primary-foreground" : pub.status === "sold" ? "bg-accent text-accent-foreground" : "bg-text text-text-foreground"}">
        ${pub.category || "Sin categoría"}
      </span>
    </div>
    <div class="p-5 flex flex-col flex-1">
      <h3 class="font-medium text-text text-lg mb-1">${pub.title || "Sin título"}</h3>
      <p class="text-text/60 text-sm mb-4 line-clamp-3">${pub.description ? pub.description.substring(0, 100) + "..." : "Sin descripción"}</p>
      <div class="flex flex-wrap gap-2 text-xs text-text/60 mb-3">
        ${pub.location ? `<span class="rounded-full bg-muted px-2 py-1">📍 ${pub.location}</span>` : ""}
        ${pub.contact_method ? `<span class="rounded-full bg-muted px-2 py-1">📞 ${pub.contact_method}</span>` : ""}
        <span class="rounded-full px-2 py-1 ${sc}">${statusText[pub.status] || pub.status}</span>
      </div>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span class="text-primary-foreground text-xs font-bold">${pub.owner?.name?.[0] || "U"}</span>
          </div>
          <span class="text-sm text-text">${pub.owner?.name || "Usuario"}</span>
        </div>
        <span class="font-bold text-primary">$${parseFloat(pub.price).toFixed(2)}</span>
      </div>
      <button class="btn-contact w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2 rounded-full transition">Contactar</button>
    </div>
  `;

  // Click en contactar
  card.querySelector(".btn-contact").addEventListener("click", (e) => {
    e.stopPropagation();
    alert(`Contactar a ${pub.owner?.name || "usuario"} sobre "${pub.title}"`);
  });

  return card;
};

export default ListingCard;
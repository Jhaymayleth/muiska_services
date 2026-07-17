import { navigateTo } from "../../router/router.js";

const ListingCard = (pub = {}) => {
  const card = document.createElement("article");
  card.className =
    "rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer";
  card.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h4 class="font-semibold text-primary">${pub.title || "Sin título"}</h4>
          <p class="mt-1 text-xs uppercase tracking-wide text-text/50">${pub.category || "Sin categoría"}</p>
        </div>
        <span class="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">$${pub.price ? parseFloat(pub.price).toFixed(2) : "0.00"}</span>
      </div>
      <p class="line-clamp-3 text-sm text-text/70">${pub.description || "Sin descripción"}</p>
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
                  `<img src="${image}" alt="${pub.title || "imagen"}" class="h-20 w-20 rounded-lg object-cover" />`,
              )
              .join("")}</div>`
          : ""
      }
    </div>
  `;

  card.addEventListener("click", () => {
    navigateTo(`/publicacion/${pub.id}`);
  });

  return card;
};

export default ListingCard;

import { navigateTo } from "../../router/router.js";
import { toggleFavorite, checkFavorite } from "../../services/publication.service.js";
import { isAuthenticated } from "../../utils/auth.js";
import { getIcon } from "../../utils/icons.js";

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const formatPrice = (value) => {
  const price = Number(value ?? 0);
  if (!Number.isFinite(price) || price <= 0) return "Free";
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDistance = (value) => {
  const meters = Number(value);
  if (!Number.isFinite(meters) || meters < 0) return "";
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
};

const ListingCard = (pub = {}) => {
  const card = document.createElement("article");
  card.className =
    "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated";

  let isFavorited = false;

  const title = escapeHtml(pub.title || "Untitled listing");
  const images = Array.isArray(pub.images) ? pub.images.filter(Boolean) : [];
  const cover = images[0];
  const category = pub.category ? escapeHtml(pub.category) : "";
  const distance = formatDistance(pub.distance_meters);

  card.innerHTML = `
    <div class="relative aspect-[4/3] overflow-hidden bg-muted">
      ${
        cover
          ? `<img src="${escapeHtml(cover)}" alt="${title}" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />`
          : `<div class="flex h-full w-full items-center justify-center text-text/25">${getIcon("package", 40)}</div>`
      }
      ${category ? `<span class="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-text/70 shadow-sm backdrop-blur">${category}</span>` : ""}
      <button type="button" class="favorite-btn absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-text/50 shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-primary active:scale-95" aria-label="Add to favorites" aria-pressed="false">
        <svg class="h-5 w-5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <div class="flex items-start justify-between gap-3">
        <h3 class="line-clamp-2 font-display text-lg font-semibold leading-snug text-text">${title}</h3>
        <span class="shrink-0 font-display text-lg font-bold text-primary">${escapeHtml(formatPrice(pub.price))}</span>
      </div>

      <p class="line-clamp-2 text-sm leading-relaxed text-text/60">${escapeHtml(pub.description || "No description provided.")}</p>

      <div class="mt-auto flex flex-wrap items-center gap-2 border-t border-border/70 pt-3 text-xs text-text/60">
        ${pub.location ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1"><span class="inline-flex text-text/40">${getIcon("location", 13)}</span>${escapeHtml(pub.location)}</span>` : ""}
        ${distance ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary"><span class="inline-flex">${getIcon("location", 13)}</span>${escapeHtml(distance)}</span>` : ""}
        ${pub.contact_method ? `<span class="inline-flex items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1"><span class="inline-flex text-text/40">${getIcon("phone", 13)}</span>${escapeHtml(pub.contact_method)}</span>` : ""}
      </div>
    </div>
  `;

  const renderHeart = () => {
    const heartBtn = card.querySelector(".favorite-btn");
    if (!heartBtn) return;
    heartBtn.classList.toggle("text-primary", isFavorited);
    heartBtn.setAttribute("aria-pressed", String(isFavorited));
    heartBtn.setAttribute("aria-label", isFavorited ? "Remove from favorites" : "Add to favorites");
    heartBtn.querySelector("svg")?.classList.toggle("fill-current", isFavorited);
  };

  const checkFavStatus = async () => {
    if (!isAuthenticated() || !pub.id) return;
    try {
      const result = await checkFavorite(pub.id);
      isFavorited = Boolean(result?.favorited);
      renderHeart();
    } catch (error) {
      console.warn("Error checking favorite:", error);
    }
  };

  card.querySelector(".favorite-btn")?.addEventListener("click", async (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (!isAuthenticated()) {
      navigateTo("/login");
      return;
    }
    if (!pub.id) return;

    try {
      const result = await toggleFavorite(pub.id);
      isFavorited = Boolean(result?.favorited);
      renderHeart();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      window.alert(error.message || "Error updating favorite");
    }
  });

  card.addEventListener("click", (event) => {
    if (event.target.closest(".favorite-btn")) return;
    if (pub.id) navigateTo(`/listing/${pub.id}`);
  });

  checkFavStatus();

  return card;
};

export default ListingCard;

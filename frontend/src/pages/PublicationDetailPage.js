import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated, sessionStore } from "../utils/auth.js";
import { toggleFavorite, checkFavorite } from "../services/publication.service.js";
import { loadTemplate } from "../utils/templateLoader.js";
import { formatDate, escapeHtml } from "../utils/helpers.js";

const PublicationDetailPage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto max-w-3xl space-y-6";

  // Load base template (loading state + detail-template script)
  const baseTemplate = loadTemplate("PublicationDetailPage");
  section.innerHTML = baseTemplate;

  const container = section.querySelector("#detail-container");
  const ownerActions = section.querySelector("#owner-actions");

  const pathParts = window.location.pathname.split("/");
  const publicationId = pathParts[pathParts.length - 1];

  // Load sub-templates
  const detailTemplate = loadTemplate("PublicationDetail");
  const favButtonTemplate = loadTemplate("FavoriteButton");

  const renderFavButton = (favorited) => {
    const icon = favorited
      ? '<svg class="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
      : '<svg class="w-6 h-6 text-text/40 hover:text-red-500 transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    return favButtonTemplate
      .replace("{{icon}}", icon)
      .replace("{{ariaLabel}}", favorited ? "Remove from favorites" : "Add to favorites")
      .replace("{{title}}", favorited ? "Remove from favorites" : "Add to favorites");
  };

  api.getPublication(publicationId).then((pub) => {
    const images = Array.isArray(pub.images) && pub.images.length > 0 ? pub.images : [];
    const currentUser = isAuthenticated() ? sessionStore.getUser() : null;
    const isOwner = currentUser && pub.user_id === currentUser.id;

    let isFavorited = false;

    // Build images HTML
    let imagesHtml = "";
    if (images.length > 0) {
      imagesHtml = `<div class="rounded-xl overflow-hidden"><div class="relative aspect-video overflow-hidden" id="main-image"><img src="${images[0]}" alt="${escapeHtml(pub.title)}" class="w-full h-full object-cover" /></div>`;
      if (images.length > 1) {
        imagesHtml += `<div class="flex gap-2 mt-3 overflow-x-auto pb-2" id="thumbnails">`;
        images.forEach((img, i) => {
          imagesHtml += `<button data-index="${i}" class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${i === 0 ? "border-primary" : "border-transparent hover:border-border"}" aria-label="View image ${i + 1}"><img src="${img}" alt="${escapeHtml(pub.title)} - thumbnail ${i + 1}" class="w-full h-full object-cover" /></button>`;
        });
        imagesHtml += `</div>`;
      }
      imagesHtml += `</div>`;
    } else {
      imagesHtml = `<div class="rounded-xl bg-muted/30 aspect-video flex items-center justify-center"><svg class="w-16 h-16 text-text/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>`;
    }

    // Meta info
    let metaHtml = `<span class="flex items-center gap-1">📅 ${new Date(pub.created_at).toLocaleDateString("es-ES")}</span>`;
    if (pub.location) metaHtml += `<span class="flex items-center gap-1">📍 ${escapeHtml(pub.location)}</span>`;
    if (pub.contact_method) metaHtml += `<span class="flex items-center gap-1">📞 ${escapeHtml(pub.contact_method)}</span>`;
    const statusConfig = {
      active: { label: "Active", classes: "bg-green-100 text-green-700" },
      sold: { label: "Sold", classes: "bg-blue-100 text-blue-700" },
      inactive: { label: "Inactive", classes: "bg-gray-100 text-gray-700" },
    };
    const sc = statusConfig[pub.status] || statusConfig.inactive;
    metaHtml += `<span class="flex items-center gap-1 rounded-full ${sc.classes} px-2 py-1 capitalize">${sc.label}</span>`;

    // Render detail template
    const html = detailTemplate
      .replace("{{imagesHtml}}", imagesHtml)
      .replace("{{title}}", escapeHtml(pub.title))
      .replace("{{category}}", escapeHtml(pub.category || "No category"))
      .replace("{{price}}", pub.price ? parseFloat(pub.price).toFixed(2) : "0.00")
      .replace("{{metaHtml}}", metaHtml)
      .replace("{{description}}", escapeHtml(pub.description || "No description"))
      .replace("<!-- FAV_BTN_PLACEHOLDER -->", renderFavButton(false));

    container.innerHTML = html;

    // Check favorite status
    if (currentUser && pub.id) {
      checkFavorite(pub.id).then((result) => {
        isFavorited = result.favorited;
        const favBtn = container.querySelector(".detail-fav-btn");
        if (favBtn) {
          favBtn.innerHTML = isFavorited
            ? '<svg class="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
            : '<svg class="w-6 h-6 text-text/40 hover:text-red-500 transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
          favBtn.setAttribute("aria-label", isFavorited ? "Remove from favorites" : "Add to favorites");
        }
      });
    }

    // Thumbnail click handlers
    if (images.length > 1) {
      const mainImg = container.querySelector("#main-image img");
      container.querySelectorAll("#thumbnails button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index, 10);
          mainImg.src = images[idx];
          container.querySelectorAll("#thumbnails button").forEach((b) => b.classList.toggle("border-primary", b === btn));
        });
      });
    }

    // Owner actions
    if (isOwner) {
      ownerActions.classList.remove("hidden");
      ownerActions.innerHTML = `<div class="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-3"><h3 class="text-lg font-semibold">Your options</h3><div class="flex flex-wrap gap-3"><button id="edit-btn" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">Edit listing</button><button id="status-btn" class="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20">${pub.status === "active" ? "Mark as sold" : pub.status === "sold" ? "Reactivate" : "Activate"}</button><button id="delete-btn" class="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">Delete</button></div></div>`;

      ownerActions.querySelector("#edit-btn").addEventListener("click", () => {
        navigateTo(`/editar-publicacion/${pub.id}`);
      });

      ownerActions.querySelector("#status-btn").addEventListener("click", async () => {
        const newStatus = pub.status === "active" ? "sold" : "active";
        try {
          await api.updatePublication(pub.id, { status: newStatus });
          navigateTo(window.location.pathname);
        } catch (err) {
          alert(err.message);
        }
      });

      ownerActions.querySelector("#delete-btn").addEventListener("click", async () => {
        if (confirm("Delete this listing? This cannot be undone.")) {
          try {
            await api.deletePublication(pub.id);
            navigateTo("/dashboard");
          } catch (err) {
            alert(err.message);
          }
        }
      });
    }

    // Favorite button handler
    const favBtn = container.querySelector(".detail-fav-btn");
    if (favBtn) {
      favBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated()) {
          navigateTo("/login");
          return;
        }

        if (!pub.id) return;

        try {
          const result = await toggleFavorite(pub.id);
          isFavorited = result.favorited;
          favBtn.innerHTML = isFavorited
            ? '<svg class="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
            : '<svg class="w-6 h-6 text-text/40 hover:text-red-500 transition-colors" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
          favBtn.setAttribute("aria-label", isFavorited ? "Remove from favorites" : "Add to favorites");
        } catch (err) {
          alert(err.message || "Error updating favorite");
        }
      });
    }
  }).catch((err) => {
    container.innerHTML = `<div class="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center"><svg class="mx-auto h-12 w-12 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg><h3 class="mt-4 text-lg font-semibold">Listing not found</h3><p class="mt-2 text-sm text-text/70">${escapeHtml(err.message || "It doesn't exist or has been deleted")}</p><a href="/explorar" class="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">Back to explore</a></div>`;
  });

  return section;
};

export default PublicationDetailPage;
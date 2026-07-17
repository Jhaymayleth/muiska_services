import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated } from "../utils/auth.js";

const PublicationDetailPage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto max-w-3xl space-y-6";

  section.innerHTML = `
    <div class="rounded-2xl border border-border bg-white p-6 shadow-sm" id="detail-container">
      <div class="flex justify-center py-8">
        <div class="animate-pulse space-y-4 w-full max-w-md">
          <div class="h-6 bg-muted rounded w-3/4"></div>
          <div class="h-4 bg-muted rounded w-1/2"></div>
          <div class="h-4 bg-muted rounded w-1/3"></div>
        </div>
      </div>
    </div>
    <div id="owner-actions" class="hidden"></div>
  `;

  const container = section.querySelector("#detail-container");
  const ownerActions = section.querySelector("#owner-actions");

  const pathParts = window.location.pathname.split("/");
  const publicationId = pathParts[pathParts.length - 1];

  api.getPublication(publicationId).then((pub) => {
    const images = Array.isArray(pub.images) && pub.images.length > 0 ? pub.images : [];
    const currentUser = isAuthenticated() ? JSON.parse(localStorage.getItem("user")) : null;
    const isOwner = currentUser && pub.user_id === currentUser.id;

    container.innerHTML = `
      <div class="space-y-6">
        ${images.length > 0 ? `
          <div class="rounded-xl overflow-hidden">
            <div class="relative aspect-video overflow-hidden" id="main-image">
              <img src="${images[0]}" alt="${pub.title}" class="w-full h-full object-cover" />
            </div>
            ${images.length > 1 ? `
              <div class="flex gap-2 mt-3 overflow-x-auto pb-2" id="thumbnails">
                ${images.map((img, i) => `
                  <button 
                    data-index="${i}" 
                    class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${i === 0 ? "border-primary" : "border-transparent hover:border-border"}"
                    aria-label="Ver imagen ${i + 1}"
                  >
                    <img src="${img}" alt="${pub.title} - miniatura ${i + 1}" class="w-full h-full object-cover" />
                  </button>
                `).join("")}
              </div>
            ` : ""}
          </div>
        ` : `
          <div class="rounded-xl bg-muted/30 aspect-video flex items-center justify-center">
            <svg class="w-16 h-16 text-text/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        `}

        <div class="space-y-3">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-semibold text-primary">${pub.title}</h1>
              <p class="mt-1 text-sm uppercase tracking-wide text-text/50">${pub.category || "Sin categoría"}</p>
            </div>
            <div class="flex-shrink-0 rounded-full bg-accent/10 px-4 py-2 text-lg font-semibold text-accent">
              $${pub.price ? parseFloat(pub.price).toFixed(2) : "0.00"}
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-sm text-text/60 border-t pt-3">
            <span class="flex items-center gap-1">📅 ${new Date(pub.created_at).toLocaleDateString("es-ES")}</span>
            ${pub.location ? `<span class="flex items-center gap-1">📍 ${pub.location}</span>` : ""}
            ${pub.contact_method ? `<span class="flex items-center gap-1">📞 ${pub.contact_method}</span>` : ""}
            <span class="flex items-center gap-1 rounded-full bg-${pub.status === 'active' ? 'green' : pub.status === 'sold' ? 'blue' : 'gray'}-100 px-2 py-1 text-${pub.status === 'active' ? 'green' : pub.status === 'sold' ? 'blue' : 'gray'}-700 capitalize">${pub.status}</span>
          </div>
        </div>

        <div class="border-t pt-6">
          <h2 class="text-lg font-semibold text-text mb-3">Descripción</h2>
          <p class="text-text/70 whitespace-pre-wrap">${pub.description || "Sin descripción"}</p>
        </div>
      </div>
    `;

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

    if (isOwner) {
      ownerActions.classList.remove("hidden");
      ownerActions.innerHTML = `
        <div class="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-3">
          <h3 class="text-lg font-semibold">Tus opciones</h3>
          <div class="flex flex-wrap gap-3">
            <button id="edit-btn" class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">
              Editar publicación
            </button>
            <button id="status-btn" class="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20">
              ${pub.status === "active" ? "Marcar como vendida" : pub.status === "sold" ? "Reactivar" : "Activar"}
            </button>
            <button id="delete-btn" class="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
              Eliminar
            </button>
          </div>
        </div>
      `;

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
        if (confirm("¿Eliminar esta publicación? No se puede deshacer.")) {
          try {
            await api.deletePublication(pub.id);
            navigateTo("/dashboard");
          } catch (err) {
            alert(err.message);
          }
        }
      });
    }
  }).catch((err) => {
    container.innerHTML = `
      <div class="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-text/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <h3 class="mt-4 text-lg font-semibold">Publicación no encontrada</h3>
        <p class="mt-2 text-sm text-text/70">${err.message || "No existe o ha sido eliminada"}</p>
        <a href="/explorar" class="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">
          Volver a explorar
        </a>
      </div>
    `;
  });

  return section;
};

export default PublicationDetailPage;
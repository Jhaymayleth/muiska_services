import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated } from "../utils/auth.js";
import { chatService } from "../services/chat.service.js";
import { sessionStore } from "../state/session.store.js";
import { loadTemplate, renderTemplate } from "../utils/templateLoader.js";
import { getCategoryIcon } from "../utils/icons.js";
import { toggleFavorite } from "../services/publication.service.js";
import womanImg from "../assets/images/Woman.jpg";
import vestidorImg from "../assets/images/vestidor.jpg";

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

const formatDate = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPrice = (value) => {
  const price = Number(value ?? 0);
  if (!Number.isFinite(price) || price <= 0) return "Free";
  return `$${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

const statusLabel = (status) => {
  const labels = { active: "For sale", sold: "Sold", inactive: "Inactive" };
  return labels[status] || "For sale";
};

const statusClass = (status) => {
  const classes = {
    active: "bg-primary text-white",
    sold: "bg-accent text-white",
    inactive: "bg-text text-background",
  };
  return classes[status] || "bg-muted text-text";
};

const HomePage = async () => {
  const page = document.createElement("div");
  page.className = "flex flex-col";
  page.innerHTML = loadTemplate("HomePage")
    .replaceAll("{{womanImg}}", womanImg)
    .replaceAll("{{vestidorImg}}", vestidorImg);

  const categoriesContainer = page.querySelector("#categories-container");
  const featuredContainer = page.querySelector("#featured-container");
  const publicationCardTemplate = loadTemplate("PublicationCard");

  const retryButton = (scope, label) => `
    <div class="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
      <p class="text-sm font-medium text-text">${label}</p>
      <button type="button" data-retry="${scope}" class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text/70 transition-colors hover:border-primary/40 hover:text-primary">
        Try again
      </button>
    </div>`;

  const loadCategories = async () => {
    categoriesContainer.setAttribute("aria-busy", "true");
    categoriesContainer.innerHTML = renderTemplate("CategorySkeleton", { count: 8 });

    try {
      const categories = await api.getCategories();

      if (!Array.isArray(categories) || categories.length === 0) {
        categoriesContainer.innerHTML = `
          <div class="col-span-full rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p class="text-sm font-medium text-text">No categories yet</p>
            <p class="mt-1 text-sm text-text/60">Categories will appear here once they are available.</p>
          </div>`;
        return;
      }

      categoriesContainer.innerHTML = categories
        .slice(0, 8)
        .map((category) => {
          const name = escapeHtml(category.name || "Category");
          const description = category.description
            ? `<span class="mt-1 hidden line-clamp-2 text-xs leading-relaxed text-text/60 sm:block">${escapeHtml(category.description)}</span>`
            : "";
          const href = `/explore?category=${encodeURIComponent(category.slug || category.name || "")}`;

          return `
            <a href="${href}" class="category group flex flex-col rounded-2xl border border-border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated sm:p-5">
              <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5 text-primary ring-1 ring-primary/10 sm:h-12 sm:w-12">
                ${getCategoryIcon(category.name || "")}
              </span>
              <span class="mt-3 flex items-start justify-between gap-3 sm:mt-4">
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-text">${name}</span>
                  ${description}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5 h-4 w-4 shrink-0 text-text/30 transition-all group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </a>`;
        })
        .join("");
    } catch (error) {
      console.error("Error loading categories:", error);
      categoriesContainer.innerHTML = retryButton("categories", "We couldn't load the categories.");
      categoriesContainer
        .querySelector('[data-retry="categories"]')
        ?.addEventListener("click", loadCategories);
    } finally {
      categoriesContainer.removeAttribute("aria-busy");
    }
  };

  const createPublicationCard = (publication) => {
    const authorName = publication.user_name || "MUISKA member";
    const status = publication.status || "active";
    const image = publication.images?.[0] || vestidorImg;
    const title = escapeHtml(publication.title || "Untitled listing");

    return publicationCardTemplate
      .replaceAll("{{id}}", escapeHtml(publication.id || ""))
      .replaceAll("{{image}}", escapeHtml(image))
      .replaceAll("{{title}}", title)
      .replaceAll("{{description}}", escapeHtml(publication.description || "No description provided."))
      .replaceAll("{{location}}", escapeHtml(publication.location || "Location not set"))
      .replaceAll("{{date}}", escapeHtml(formatDate(publication.created_at)))
      .replaceAll("{{initials}}", escapeHtml(getInitials(authorName)))
      .replaceAll("{{author}}", escapeHtml(authorName))
      .replaceAll("{{userId}}", escapeHtml(publication.user_id || ""))
      .replaceAll("{{price}}", escapeHtml(formatPrice(publication.price)))
      .replaceAll("{{statusLabel}}", escapeHtml(statusLabel(status)))
      .replaceAll("{{statusClass}}", statusClass(status));
  };

  const bindCardInteractions = () => {
    featuredContainer.querySelectorAll(".contact-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated()) {
          navigateTo("/login");
          return;
        }

        const publicationId = button.dataset.pubId;
        const sellerId = button.dataset.sellerId;
        if (!publicationId || !sellerId) return;

        button.disabled = true;
        button.textContent = "Opening chat...";

        try {
          const token = sessionStore.getToken();
          if (token) chatService.connect(token);
          const result = await chatService.createConversation(publicationId, sellerId);
          const conversationId = result.conversation?.id || result.id;
          navigateTo(`/chat/${conversationId}`);
        } catch (error) {
          console.error("Error starting conversation:", error);
          window.alert(error.message || "Could not start the conversation.");
          button.disabled = false;
          button.textContent = "Contact";
        }
      });
    });

    featuredContainer.querySelectorAll(".like-btn").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isAuthenticated()) {
          navigateTo("/login");
          return;
        }

        const publicationId = button.dataset.pubId;
        if (!publicationId) return;

        button.disabled = true;
        try {
          const result = await toggleFavorite(publicationId);
          const favorited = Boolean(result?.favorited);
          button.setAttribute("aria-pressed", String(favorited));
          button.classList.toggle("text-primary", favorited);
          button.querySelector("svg")?.classList.toggle("fill-current", favorited);
        } catch (error) {
          console.error("Error updating favorite:", error);
        } finally {
          button.disabled = false;
        }
      });
    });

    featuredContainer.querySelectorAll(".publication-card").forEach((card) => {
      card.addEventListener("click", (event) => {
        if (event.target.closest(".contact-btn, .like-btn")) return;
        if (card.dataset.id) navigateTo(`/listing/${card.dataset.id}`);
      });
    });
  };

  const loadFeatured = async () => {
    featuredContainer.setAttribute("aria-busy", "true");
    featuredContainer.innerHTML = renderTemplate("FeaturedSkeleton", { count: 3 });

    try {
      const response = await api.getPublications({ status: "active", limit: 6, page: 1 });
      const publications = response.data || [];

      if (publications.length === 0) {
        featuredContainer.innerHTML = `
          <div class="col-span-full rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p class="font-display text-xl font-semibold text-text">No listings yet</p>
            <p class="mx-auto mt-2 max-w-sm text-sm text-text/60">Be the first to publish something for your community.</p>
            <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="/create" class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">Publish a listing</a>
              <a href="/explore" class="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-text/70 transition-colors hover:border-primary/40 hover:text-primary">Explore</a>
            </div>
          </div>`;
        return;
      }

      featuredContainer.innerHTML = publications.map(createPublicationCard).join("");

      featuredContainer.querySelectorAll(".publication-card").forEach((card, index) => {
        card.classList.add("animate-fade-in");
        card.style.animationDelay = `${index * 60}ms`;
      });

      bindCardInteractions();
    } catch (error) {
      console.error("Error loading featured listings:", error);
      featuredContainer.innerHTML = retryButton("featured", "We couldn't load the latest listings.");
      featuredContainer
        .querySelector('[data-retry="featured"]')
        ?.addEventListener("click", loadFeatured);
    } finally {
      featuredContainer.removeAttribute("aria-busy");
    }
  };

  loadCategories();
  loadFeatured();

  return page;
};

export default HomePage;

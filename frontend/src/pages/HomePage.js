import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated } from "../utils/auth.js";
import { chatService } from "../services/chat.service.js";
import { sessionStore } from "../state/session.store.js";
import { loadTemplate, renderTemplate } from "../utils/templateLoader.js";
import { getCategoryIcon } from "../utils/icons.js";
import womanImg from "../assets/images/Woman.jpg";
import vestidorImg from "../assets/images/vestidor.jpg";

const navigate = (path) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "No date";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const statusLabel = (status) => {
  const labels = { active: "For Sale", sold: "Sold", inactive: "Inactive" };
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

  const loadCategories = async () => {
    categoriesContainer.innerHTML = renderTemplate("CategorySkeleton", { count: 4 });
    try {
      const categories = await api.getCategories();
      if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p class="col-span-full text-center text-sm text-text/60">No categories available.</p>';
        return;
      }
      categoriesContainer.innerHTML = categories
        .slice(0, 8)
        .map(
          (cat, i) => `
            <a href="/explore?category=${encodeURIComponent(cat.name)}" class="category flex items-center gap-4 bg-background border border-border rounded-2xl px-5 py-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated hover:border-primary hover:bg-primary/5 active:scale-95 cursor-pointer animate-slide-up" style="animation-delay: ${i * 80}ms">
              <span class="text-3xl">${getCategoryIcon(cat.name)}</span>
              <h3 class="font-medium text-text">${cat.name}</h3>
            </a>
          `
        )
        .join("");
    } catch (err) {
      categoriesContainer.innerHTML = '<p class="col-span-full text-center text-sm text-red-600">Error loading categories.</p>';
    }
  };

  const renderFeaturedLoader = () => {
    featuredContainer.innerHTML = renderTemplate("FeaturedSkeleton", { count: 3 });
  };

  const createPublicationCard = (pub) => {
    const authorName = pub.user_name || "User";
    const initials = getInitials(authorName);
    const userBg = authorName !== "User" ? "bg-primary" : "bg-muted";
    const typeLabel = statusLabel(pub.status || "active");
    const typeClass = statusClass(pub.status || "active");
    const image = pub.images?.[0] || vestidorImg;

    return publicationCardTemplate
      .replaceAll("{{id}}", pub.id)
      .replaceAll("{{image}}", image)
      .replaceAll("{{title}}", pub.title)
      .replaceAll("{{description}}", pub.description?.slice(0, 100) || "")
      .replaceAll("{{descriptionMore}}", pub.description?.length > 100 ? "..." : "")
      .replaceAll("{{location}}", pub.location || "No location")
      .replaceAll("{{date}}", formatDate(pub.created_at))
      .replaceAll("{{initials}}", initials)
      .replaceAll("{{userBg}}", userBg)
      .replaceAll("{{author}}", authorName)
      .replaceAll("{{userId}}", pub.user_id || "")
      .replaceAll("{{price}}", Number(pub.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
      .replaceAll("{{statusLabel}}", typeLabel)
      .replaceAll("{{statusClass}}", typeClass);
  };

  const loadFeatured = async () => {
    renderFeaturedLoader();
    try {
      const response = await api.getPublications({ status: "active", limit: 6, page: 1 });
      const pubs = response.data || [];

      if (pubs.length === 0) {
        featuredContainer.innerHTML = `
          <div class="col-span-full rounded-xl border border-dashed border-border bg-background p-8 text-center">
            <h3 class="text-lg font-semibold">No featured listings</h3>
            <p class="mt-2 text-sm text-text/70">Be the first to create one.</p>
          </div>`;
        return;
      }

      featuredContainer.innerHTML = pubs.map(createPublicationCard).join("");

      featuredContainer.querySelectorAll(".publication-card").forEach((card, i) => {
        card.classList.add("animate-fade-in");
        card.style.animationDelay = `${i * 100}ms`;
      });

      featuredContainer.querySelectorAll(".contact-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (!isAuthenticated()) {
            navigateTo("/login");
            return;
          }
          const pubId = btn.dataset.pubId;
          const sellerId = btn.dataset.sellerId;
          if (!pubId || !sellerId) return;
          try {
            const token = sessionStore.getToken();
            if (token) chatService.connect(token);
            const result = await chatService.createConversation(pubId, sellerId);
            const convId = result.conversation?.id || result.id;
            navigateTo(`/chat/${convId}`);
          } catch (err) {
            alert(err.message || "Could not start conversation");
          }
        });
      });

      featuredContainer.querySelectorAll(".publication-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest(".contact-btn") || e.target.closest(".like-btn")) return;
          const btn = card.querySelector(".contact-btn");
          if (btn) navigateTo(`/listing/${btn.dataset.pubId}`);
        });
      });
    } catch (err) {
      featuredContainer.innerHTML = `
        <div class="col-span-full rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
          <p class="text-red-600">${err.message || "Error loading listings"}</p>
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
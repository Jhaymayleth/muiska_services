import { api } from "../services/api.js";
import ListingCard from "../components/listing/ListingCard.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const ExplorePage = async () => {
  const template = loadTemplate("ExplorePage");
  const emptyStateHtml = loadTemplate("ExploreStates").match(/id="explore-empty-state">([\s\S]*?)<\/script>/)[1];
  const errorStateHtml = loadTemplate("ExploreStates").match(/id="explore-error-state">([\s\S]*?)<\/script>/)[1];
  const section = document.createElement("section");
  section.className = "space-y-6";

  let currentPage = 1;
  const pageSize = 12;
  let totalPages = 1;
  let currentFilters = { status: "active" };

  section.innerHTML = template;

  const grid = section.querySelector("#listings-grid");
  const pagination = section.querySelector("#pagination");
  const form = section.querySelector("#filter-form");
  const categorySelect = section.querySelector("#category");
  const clearBtn = section.querySelector("#clear-filters");

  const render = async () => {
    grid.innerHTML = '<div class="col-span-full flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>';
    pagination.innerHTML = "";

    try {
      const response = await api.getPublications({
        ...currentFilters,
        page: currentPage,
        limit: pageSize,
      });

      const { data: pubs, pagination } = response;
      totalPages = pagination?.totalPages || 1;

      if (pubs.length === 0) {
        grid.innerHTML = emptyStateHtml;
      } else {
        grid.innerHTML = "";
        pubs.forEach((pub) => grid.appendChild(ListingCard(pub)));
      }

      renderPagination(pagination);
    } catch (err) {
      grid.innerHTML = errorStateHtml.replace("{{errorMessage}}", err.message || "Error loading listings");
    }
  };

  const renderPagination = (pagination) => {
    if (!pagination || pagination.totalPages <= 1) return;

    const { page, totalPages } = pagination;
    let html = '<nav class="flex items-center justify-center gap-2" aria-label="Pagination">';

    if (page > 1) {
      html += `<button data-page="${page - 1}" class="pagination-btn rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition">Previous</button>`;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      html += `<button data-page="${i}" class="pagination-btn w-8 h-8 rounded-lg text-sm font-medium transition ${i === page ? "bg-primary text-white" : "hover:bg-muted"}">${i}</button>`;
    }

    if (page < totalPages) {
      html += `<button data-page="${page + 1}" class="pagination-btn rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition">Next</button>`;
    }

    html += "</nav>";
    pagination.innerHTML = html;

    pagination.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page, 10);
        render();
      });
    });
  };

  api.getCategories().then((categories) => {
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.slug || cat.name;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    currentFilters = {
      status: "active",
      search: formData.get("search") || undefined,
      category: formData.get("category") || undefined,
      minPrice: formData.get("minPrice") ? parseFloat(formData.get("minPrice")) : undefined,
      maxPrice: formData.get("maxPrice") ? parseFloat(formData.get("maxPrice")) : undefined,
      location: formData.get("location") || undefined,
    };
    currentPage = 1;
    render();
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    currentFilters = { status: "active" };
    currentPage = 1;
    render();
  });

  render();

  return section;
};

export default ExplorePage;
import { api } from "../../services/api.js";
import ListingCard from "../../components/listing/ListingCard.js";
import { navigateTo } from "../../router/router.js";

const ExplorePage = () => {
  const section = document.createElement("section");
  section.className = "space-y-6";

  let currentPage = 1;
  const pageSize = 12;
  let totalPages = 1;
  let currentFilters = { status: "active" };

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
        grid.innerHTML = `
          <div class="col-span-full rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <h3 class="text-lg font-semibold">No hay publicaciones</h3>
            <p class="mt-2 text-sm text-text/70">Intenta ajustar los filtros o sé el primero en crear una.</p>
          </div>`;
      } else {
        grid.innerHTML = "";
        pubs.forEach((pub) => grid.appendChild(ListingCard(pub)));
      }

      renderPagination(pagination);
    } catch (err) {
      grid.innerHTML = `
        <div class="col-span-full rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
          <p class="text-red-600">${err.message || "Error al cargar publicaciones"}</p>
        </div>`;
    }
  };

  const renderPagination = (pagination) => {
    if (!pagination || pagination.totalPages <= 1) return;

    const { page, totalPages } = pagination;
    let html = '<nav class="flex items-center justify-center gap-2" aria-label="Paginación">';

    if (page > 1) {
      html += `<button data-page="${page - 1}" class="pagination-btn rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition">Anterior</button>`;
    }

    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      html += `<button data-page="${i}" class="pagination-btn w-8 h-8 rounded-lg text-sm font-medium transition ${i === page ? "bg-primary text-white" : "hover:bg-muted"}">${i}</button>`;
    }

    if (page < totalPages) {
      html += `<button data-page="${page + 1}" class="pagination-btn rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted transition">Siguiente</button>`;
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

  section.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <h1 class="text-3xl font-semibold text-primary">Explorar</h1>
    </div>

    <div class="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <form id="filter-form" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div class="sm:col-span-2">
          <label for="search" class="block text-sm font-medium text-text mb-1">Buscar</label>
          <input
            type="search"
            id="search"
            name="search"
            placeholder="Título, descripción..."
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label for="category" class="block text-sm font-medium text-text mb-1">Categoría</label>
          <select
            id="category"
            name="category"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          >
            <option value="">Todas</option>
          </select>
        </div>
        <div>
          <label for="minPrice" class="block text-sm font-medium text-text mb-1">Precio mínimo</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            step="0.01"
            min="0"
            placeholder="0"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div>
          <label for="maxPrice" class="block text-sm font-medium text-text mb-1">Precio máximo</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            step="0.01"
            min="0"
            placeholder="∞"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div class="sm:col-span-2 lg:col-span-1">
          <label for="location" class="block text-sm font-medium text-text mb-1">Ubicación</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Ciudad, barrio..."
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
          />
        </div>
        <div class="sm:col-span-2 lg:col-span-1 flex items-end">
          <button
            type="submit"
            class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Filtrar
          </button>
        </div>
        <div class="sm:col-span-2 lg:col-span-1 flex items-end">
          <button
            type="button"
            id="clear-filters"
            class="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-text hover:bg-muted transition"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>

    <div id="listings-grid" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"></div>

    <div id="pagination" class="flex justify-center"></div>
  `;

  const grid = section.querySelector("#listings-grid");
  const pagination = section.querySelector("#pagination");
  const form = section.querySelector("#filter-form");
  const categorySelect = section.querySelector("#category");
  const clearBtn = section.querySelector("#clear-filters");

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
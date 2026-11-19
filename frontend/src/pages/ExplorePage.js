import { api } from "../services/api.js";
import ListingCard from "../components/listing/ListingCard.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";
import { createBarrioAutocomplete } from "../components/BarrioAutocomplete.js";
import { escapeHtml } from "../utils/helpers.js";
import { useGeolocation } from "../hooks/useGeolocation.js";

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
  let userCoords = null;
  const geolocation = useGeolocation();

  const urlParams = new URLSearchParams(window.location.search);
  const urlCategory = urlParams.get("category");
  if (urlCategory) {
    currentFilters.category = urlCategory;
  }

  section.innerHTML = template;

  const grid = section.querySelector("#listings-grid");
  const pagination = section.querySelector("#pagination");
  const form = section.querySelector("#filter-form");
  const categorySelect = section.querySelector("#category");
  const clearBtn = section.querySelector("#clear-filters");
  const useLocationBtn = section.querySelector("#use-location");
  const locationStatus = section.querySelector("#location-status");

  const setLocationStatus = (message, isError = false) => {
    if (!locationStatus) return;
    locationStatus.textContent = message;
    locationStatus.classList.toggle("text-red-600", isError);
    locationStatus.classList.toggle("text-text/60", !isError);
  };

  // Pide la ubicación solo cuando hace falta (filtro de distancia o botón) y
  // cachea el resultado para no repetir el permiso del navegador.
  const resolveCoords = async () => {
    if (userCoords) return userCoords;
    try {
      userCoords = await geolocation.getCurrentPosition();
      setLocationStatus(`Using your location (±${Math.round(userCoords.accuracy)} m)`);
      return userCoords;
    } catch (err) {
      setLocationStatus(
        err?.code === 1
          ? "Location permission denied. Distance filter ignored."
          : "Could not get your location. Distance filter ignored.",
        true,
      );
      return null;
    }
  };

  useLocationBtn?.addEventListener("click", async () => {
    useLocationBtn.disabled = true;
    setLocationStatus("Getting your location...");
    await resolveCoords();
    useLocationBtn.disabled = false;
  });

  const locationInput = section.querySelector("#location");
  const autocompleteContainer = section.querySelector("#neighborhood-autocomplete");
  const barrioAutocomplete = createBarrioAutocomplete({
    placeholder: "Neighborhood name",
    onSelect: ({ name }) => {
      locationInput.value = name || "";
    },
  });
  autocompleteContainer.appendChild(barrioAutocomplete.element);

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
      grid.innerHTML = errorStateHtml.replace("{{errorMessage}}", () => escapeHtml(err.message || "Error loading listings"));
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

    if (urlCategory) {
      categorySelect.value = urlCategory;
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const radius = formData.get("radius");

    // El filtro por distancia solo se envía si el navegador dio coordenadas.
    let geoFilters = {};
    if (radius) {
      const coords = await resolveCoords();
      if (coords) {
        geoFilters = { lat: coords.lat, lng: coords.lng, radius: Number(radius) };
      }
    }

    currentFilters = {
      status: "active",
      search: formData.get("search") || undefined,
      category: formData.get("category") || undefined,
      minPrice: formData.get("minPrice") ? parseFloat(formData.get("minPrice")) : undefined,
      maxPrice: formData.get("maxPrice") ? parseFloat(formData.get("maxPrice")) : undefined,
      location: locationInput.value || undefined,
      ...geoFilters,
    };
    currentPage = 1;
    render();
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    barrioAutocomplete.clear();
    locationInput.value = "";
    userCoords = null;
    setLocationStatus("");
    currentFilters = { status: "active" };
    currentPage = 1;
    render();
  });

  render();

  return section;
};

export default ExplorePage;
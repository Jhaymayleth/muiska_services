import { api } from "../services/api.js";

export function createBarrioAutocomplete({ placeholder = "Search neighborhood...", onSelect = () => {} } = {}) {
  const container = document.createElement("div");
  container.className = "relative barrio-autocomplete";

  container.innerHTML = `
    <input
      type="text"
      id="barrio-input"
      placeholder="${placeholder}"
      autocomplete="off"
      class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 outline-none focus:border-primary"
    />
    <input type="hidden" id="barrio-id" />
    <div
      id="barrio-dropdown"
      class="absolute z-50 hidden max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
    ></div>
  `;

  const input = container.querySelector("#barrio-input");
  const hiddenInput = container.querySelector("#barrio-id");
  const dropdown = container.querySelector("#barrio-dropdown");

  let currentTimeout = null;
  let currentResults = [];
  let selectedIndex = -1;

  const fetchBarrios = async (query) => {
    if (query.length < 2) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      return;
    }
    try {
      const res = await api.searchBarrios(query);
      currentResults = res.barrios || [];
      renderResults(currentResults);
    } catch (err) {
      dropdown.innerHTML = '<p class="p-2 text-sm text-gray-500">Error searching neighborhoods</p>';
      dropdown.classList.remove("hidden");
    }
  };

  const renderResults = (barrios) => {
    if (barrios.length === 0) {
      dropdown.innerHTML = '<p class="p-2 text-sm text-gray-500">No neighborhoods found</p>';
      dropdown.classList.remove("hidden");
      return;
    }
    dropdown.innerHTML = barrios
      .map(
        (b, i) => `
        <div
          class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-50 ${i === selectedIndex ? "bg-primary/5" : ""}"
          data-barrio-id="${b.id}"
          data-barrio-name="${b.name}"
          data-barrio-locality="${b.locality}"
        >
          <div class="font-medium">${b.name}</div>
          <div class="text-xs text-gray-500">${b.locality}</div>
        </div>
      `
      )
      .join("");
    dropdown.classList.remove("hidden");

    dropdown.querySelectorAll("[data-barrio-id]").forEach((el, i) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectBarrio(el.dataset.barrioId, el.dataset.barrioName, el.dataset.barrioLocality);
      });
    });
  };

  const selectBarrio = (id, name, locality) => {
    input.value = name;
    hiddenInput.value = id;
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";
    currentResults = [];
    selectedIndex = -1;
    onSelect({ id, name, locality });
  };

  input.addEventListener("input", () => {
    clearTimeout(currentTimeout);
    selectedIndex = -1;
    currentTimeout = setTimeout(() => fetchBarrios(input.value.trim()), 300);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
      updateHighlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateHighlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
        const b = currentResults[selectedIndex];
        selectBarrio(b.id, b.name, b.locality);
      }
    } else if (e.key === "Escape") {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      currentResults = [];
      selectedIndex = -1;
    }
  });

  const updateHighlight = () => {
    const items = dropdown.querySelectorAll("[data-barrio-id]");
    items.forEach((el, i) => {
      el.classList.toggle("bg-primary/5", i === selectedIndex);
    });
  };

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      currentResults = [];
      selectedIndex = -1;
    }
  });

  return {
    element: container,
    getValue: () => hiddenInput.value,
    getTextValue: () => input.value,
    setValue: (id, name) => {
      input.value = name || "";
      hiddenInput.value = id || "";
    },
    clear: () => {
      input.value = "";
      hiddenInput.value = "";
      dropdown.classList.add("hidden");
      dropdown.innerHTML = "";
      currentResults = [];
      selectedIndex = -1;
    },
  };
}

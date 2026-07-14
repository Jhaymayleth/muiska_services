import { api } from "../../services/api.js";
import ListingCard from "../../components/listing/ListingCard.js";

const ExplorePage = () => {
  const section = document.createElement("section");
  section.className = "space-y-6";
  section.innerHTML = `
    <h1 class="text-3xl font-semibold text-primary">Explorar</h1>
    <div id="listings-grid" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"></div>
  `;

  const grid = section.querySelector("#listings-grid");

  api.getPublications().then((pubs) => {
    if (pubs.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
          <h3 class="text-lg font-semibold">No hay publicaciones aún</h3>
          <p class="mt-2 text-sm text-text/70">Sé el primero en crear una.</p>
        </div>`;
      return;
    }
    pubs.forEach((pub) => grid.appendChild(ListingCard(pub)));
  });

  return section;
};

export default ExplorePage;

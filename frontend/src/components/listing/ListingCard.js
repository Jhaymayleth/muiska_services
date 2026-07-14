const ListingCard = (pub = {}) => {
  const card = document.createElement("article");
  card.className =
    "rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md";
  card.innerHTML = `
    <h4 class="font-semibold text-primary">${pub.title || "Sin título"}</h4>
    <p class="mt-2 line-clamp-2 text-sm text-text/70">${pub.description || "Sin descripción"}</p>
    <div class="mt-3 flex items-center justify-between">
      <span class="text-lg font-semibold text-accent">$${pub.price ? parseFloat(pub.price).toFixed(2) : "0.00"}</span>
      ${pub.category ? `<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-text/60">${pub.category}</span>` : ""}
    </div>
  `;
  return card;
};

export default ListingCard;

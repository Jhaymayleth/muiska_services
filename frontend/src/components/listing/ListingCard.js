const ListingCard = () => {
  const card = document.createElement("article");
  card.className = "rounded-xl border border-border bg-white p-4";
  card.innerHTML =
    '<h4 class="font-semibold">Publicación</h4><p class="mt-2 text-sm text-text/70">Detalle placeholder.</p>';
  return card;
};

export default ListingCard;

const Card = () => {
  const card = document.createElement("section");
  card.className = "rounded-xl border border-border bg-white p-6 shadow-sm";
  card.innerHTML =
    '<h3 class="text-lg font-semibold">Card</h3><p class="mt-2 text-sm text-text/70">Contenido placeholder.</p>';
  return card;
};

export default Card;

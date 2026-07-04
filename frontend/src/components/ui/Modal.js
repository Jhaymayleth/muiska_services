const Modal = () => {
  const modal = document.createElement("div");
  modal.className = "rounded-xl border border-border bg-white p-6";
  modal.innerHTML =
    '<h3 class="text-lg font-semibold">Modal</h3><p class="mt-2 text-sm text-text/70">Contenido placeholder.</p>';
  return modal;
};

export default Modal;

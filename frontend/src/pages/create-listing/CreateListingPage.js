import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";

const CreateListingPage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto max-w-2xl space-y-6";

  section.innerHTML = `
    <h1 class="text-3xl font-semibold text-primary">Crear Publicación</h1>
    <form id="create-listing-form" class="space-y-4 rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div class="space-y-2">
        <label class="text-sm font-medium text-text" for="title">Título</label>
        <input id="title" name="title" required
          class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-text" for="description">Descripción</label>
        <textarea id="description" name="description" rows="4"
          class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-text" for="price">Precio</label>
          <input id="price" name="price" type="number" step="0.01" required
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-text" for="category">Categoría</label>
          <input id="category" name="category"
            class="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
        </div>
      </div>
      <button type="submit"
        class="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-hover">
        Publicar
      </button>
    </form>
  `;

  section.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      title: form.title.value,
      description: form.description.value,
      price: parseFloat(form.price.value),
      category: form.category.value || null,
    };
    try {
      await api.createPublication(data);
      navigateTo("/explorar");
    } catch (err) {
      alert(err.message);
    }
  });

  return section;
};

export default CreateListingPage;

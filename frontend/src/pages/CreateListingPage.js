import { createPublication, getCategories } from "../services/publication.service.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const CreateListingPage = () => {
  const template = loadTemplate("CreateListingPage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-2xl space-y-6";

  section.innerHTML = template;

  const categorySelect = section.querySelector("#category");

  getCategories().then((categories) => {
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.slug || cat.name;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  });

  section.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const images = Array.from(form.images.files);

    const data = {
      title: form.title.value,
      description: form.description.value,
      price: parseFloat(form.price.value),
      category: form.category.value || null,
      location: form.location.value || null,
      contactMethod: form.contactMethod.value || null,
    };
    try {
      await createPublication(data, images);
      navigateTo("/explorar");
    } catch (err) {
      alert(err.message);
    }
  });

  return section;
};

export default CreateListingPage;

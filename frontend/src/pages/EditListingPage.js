import { getPublication, updatePublication, getCategories } from "../services/publication.service.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const EditListingPage = () => {
  const template = loadTemplate("EditListingPage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-2xl space-y-6";
  section.innerHTML = template;

  const id = window.location.pathname.split("/").pop();

  getPublication(id)
    .then((pub) => {
      const form = section.querySelector("form");
      const categorySelect = section.querySelector("#category");

      form.title.value = pub.title || "";
      form.description.value = pub.description || "";
      form.price.value = pub.price || "";
      form.location.value = pub.location || "";
      form.contactMethod.value = pub.contact_method || "";

      getCategories().then((categories) => {
        categories.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.slug || cat.name;
          option.textContent = cat.name;
          categorySelect.appendChild(option);
        });
        if (pub.category) {
          categorySelect.value = pub.category;
        }
      });

      if (Array.isArray(pub.images) && pub.images.length > 0) {
        const imagesContainer = document.createElement("div");
        imagesContainer.className = "flex gap-2 overflow-x-auto mb-4";
        imagesContainer.innerHTML = pub.images
          .slice(0, 5)
          .map(
            (image) =>
              `<img src="${image}" alt="imagen actual" class="h-20 w-20 rounded-lg object-cover" />`,
          )
          .join("");
        form.prepend(imagesContainer);
      }

      form.addEventListener("submit", async (e) => {
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
          await updatePublication(id, data, images);
          navigateTo("/dashboard");
        } catch (err) {
          alert(err.message);
        }
      });
    })
    .catch(() => {
      section.innerHTML =
        '<p class="text-sm text-red-500">Error al cargar la publicación.</p>';
    });

  return section;
};

export default EditListingPage;

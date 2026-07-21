import { loadTemplate } from "../utils/templateLoader.js";

const NotFoundPage = () => {
  const template = loadTemplate("NotFoundPage");
  const section = document.createElement("section");
  section.className =
    "space-y-4 rounded-2xl border border-border bg-white p-8 shadow-sm";
  section.innerHTML = template;
  return section;
};

export default NotFoundPage;

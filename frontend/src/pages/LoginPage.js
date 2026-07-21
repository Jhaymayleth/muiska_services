import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const LoginPage = () => {
  const template = loadTemplate("LoginPage");
  const section = document.createElement("section");
  section.className =
    "mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm";

  section.innerHTML = template;

  const form = section.querySelector("#login-form");
  const errorEl = section.querySelector("#login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      errorEl.textContent = "Todos los campos son obligatorios.";
      errorEl.classList.remove("hidden");
      return;
    }

    try {
      const result = await api.login(email, password);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      const redirectPath = result.user.role === "admin" ? "/admin" : "/dashboard";
      navigateTo(redirectPath);
    } catch (err) {
      errorEl.textContent = err.message || "Error al iniciar sesión.";
      errorEl.classList.remove("hidden");
    }
  });

  return section;
};

export default LoginPage;

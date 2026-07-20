import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const RegisterPage = () => {
  const template = loadTemplate("RegisterPage");
  const section = document.createElement("section");
  section.className =
    "mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm";

  section.innerHTML = template;

  const form = section.querySelector("#register-form");
  const errorEl = section.querySelector("#register-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const passwordConfirm = form["password-confirm"].value;

    // Validaciones
    if (!name || !email || !password || !passwordConfirm) {
      errorEl.textContent = "Todos los campos son obligatorios.";
      errorEl.classList.remove("hidden");
      return;
    }

    if (name.length < 3) {
      errorEl.textContent = "El nombre debe tener al menos 3 caracteres.";
      errorEl.classList.remove("hidden");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorEl.textContent = "Por favor ingresa un correo válido.";
      errorEl.classList.remove("hidden");
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = "La contraseña debe tener al menos 6 caracteres.";
      errorEl.classList.remove("hidden");
      return;
    }

    if (password !== passwordConfirm) {
      errorEl.textContent = "Las contraseñas no coinciden.";
      errorEl.classList.remove("hidden");
      return;
    }

    try {
      const result = await api.register({ name, email, password });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      const redirectPath = result.user.role === "admin" ? "/admin" : "/dashboard";
      navigateTo(redirectPath);
    } catch (err) {
      errorEl.textContent = err.message || "Error al registrarse.";
      errorEl.classList.remove("hidden");
    }
  });

  return section;
};

export default RegisterPage;

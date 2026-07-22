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
    const userType = form.userType?.value || "client";

    // Validaciones
    if (!name || !email || !password || !passwordConfirm) {
      errorEl.textContent = "All fields are required.";
      errorEl.classList.remove("hidden");
      return;
    }

    if (name.length < 3) {
      errorEl.textContent = "Name must be at least 3 characters.";
      errorEl.classList.remove("hidden");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorEl.textContent = "Please enter a valid email.";
      errorEl.classList.remove("hidden");
      return;
    }

    if (password.length < 6) {
      errorEl.textContent = "Password must be at least 6 characters.";
      errorEl.classList.remove("hidden");
      return;
    }

    if (password !== passwordConfirm) {
      errorEl.textContent = "Passwords do not match.";
      errorEl.classList.remove("hidden");
      return;
    }

    try {
      const result = await api.register({ name, email, password, userType });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      
      // Redirigir según tipo de usuario y estado de verificación
      let redirectPath = "/dashboard";
      if (result.user.user_type === "seller" && result.user.verification_status !== "approved") {
        redirectPath = "/verificacion-pendiente";
      } else if (result.user.role === "admin") {
        redirectPath = "/admin";
      }
      navigateTo(redirectPath);
    } catch (err) {
      errorEl.textContent = err.message || "Error registering.";
      errorEl.classList.remove("hidden");
    }
  });

  return section;
};

export default RegisterPage;

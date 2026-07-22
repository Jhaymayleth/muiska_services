import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const RegisterPage = () => {
  const template = loadTemplate("RegisterPage");
  const section = document.createElement("section");
  section.className =
    "mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-elevated animate-scale-in";

  section.innerHTML = template;

  const form = section.querySelector("#register-form");
  const errorEl = section.querySelector("#register-error");
  const errorText = section.querySelector("#register-error-text");
  const submitBtn = section.querySelector("#register-submit");
  const btnText = section.querySelector("#register-btn-text");
  const spinner = section.querySelector("#register-spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    btnText.textContent = "Loading...";
    spinner.classList.remove("hidden");

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const passwordConfirm = form["password-confirm"].value;
    const userType = form.userType?.value || "client";

    // Validaciones
    if (!name || !email || !password || !passwordConfirm) {
      errorText.textContent = "All fields are required.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    if (name.length < 3) {
      errorText.textContent = "Name must be at least 3 characters.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorText.textContent = "Please enter a valid email.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    if (password.length < 8) {
      errorText.textContent = "Password must be at least 8 characters.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      errorText.textContent = "Password must contain at least one uppercase letter.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    if (!/[a-z]/.test(password)) {
      errorText.textContent = "Password must contain at least one lowercase letter.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    if (!/[0-9]/.test(password)) {
      errorText.textContent = "Password must contain at least one number.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    if (password !== passwordConfirm) {
      errorText.textContent = "Passwords do not match.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
      return;
    }

    try {
      const result = await api.register({ name, email, password, userType });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      
      // Redirigir según tipo de usuario y estado de verificación
      let redirectPath = "/dashboard";
      if (result.user.user_type === "seller" && result.user.verification_status !== "approved") {
        redirectPath = "/verification-pending";
      } else if (result.user.role === "admin") {
        redirectPath = "/admin";
      }
      navigateTo(redirectPath);
    } catch (err) {
      const msg = err.details
        ? Object.values(err.details).flat().join("; ")
        : err.message;
      errorText.textContent = msg || "Error registering.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Register";
      spinner.classList.add("hidden");
    }
  });

  return section;
};

export default RegisterPage;

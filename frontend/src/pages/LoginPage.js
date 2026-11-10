import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const LoginPage = () => {
  const section = document.createElement("section");
  section.className = "w-full";
  section.innerHTML = loadTemplate("LoginPage");

  const form = section.querySelector("#login-form");
  const errorEl = section.querySelector("#login-error");
  const errorText = section.querySelector("#login-error-text");
  const submitBtn = section.querySelector("#login-submit");
  const btnText = section.querySelector("#login-btn-text");
  const spinner = section.querySelector("#login-spinner");

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? "Signing in..." : "Sign in";
    spinner.classList.toggle("hidden", !loading);
  };

  const clearError = () => {
    errorEl.classList.add("hidden");
    errorEl.classList.remove("flex");
    errorText.textContent = "";
  };

  const showError = (message) => {
    errorText.textContent = message;
    errorEl.classList.remove("hidden");
    errorEl.classList.add("flex");
    errorEl.focus();
  };

  section.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = section.querySelector(`#${button.dataset.togglePassword}`);
      if (!input) return;

      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
      button.querySelector("[data-eye]")?.classList.toggle("hidden", show);
      button.querySelector("[data-eye-off]")?.classList.toggle("hidden", !show);
    });
  });

  form.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", clearError);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      showError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const result = await api.login(email, password);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      navigateTo(result.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      showError(error.message || "We couldn't sign you in. Please try again.");
      setLoading(false);
    }
  });

  return section;
};

export default LoginPage;

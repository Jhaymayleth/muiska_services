import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const RegisterPage = () => {
  const section = document.createElement("section");
  section.className = "w-full";
  section.innerHTML = loadTemplate("RegisterPage");

  const form = section.querySelector("#register-form");
  const errorEl = section.querySelector("#register-error");
  const errorText = section.querySelector("#register-error-text");
  const submitBtn = section.querySelector("#register-submit");
  const btnText = section.querySelector("#register-btn-text");
  const spinner = section.querySelector("#register-spinner");

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    btnText.textContent = loading ? "Creating account..." : "Create account";
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

  const fail = (message) => {
    showError(message);
    setLoading(false);
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

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const passwordConfirm = form["password-confirm"].value;
    const userType = form.userType?.value || "client";

    if (!name || !email || !password || !passwordConfirm) {
      return fail("All fields are required.");
    }

    if (name.length < 3) {
      return fail("Name must be at least 3 characters.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return fail("Please enter a valid email address.");
    }

    if (password.length < 8) {
      return fail("Password must be at least 8 characters.");
    }

    if (!/[A-Z]/.test(password)) {
      return fail("Password must contain at least one uppercase letter.");
    }

    if (!/[a-z]/.test(password)) {
      return fail("Password must contain at least one lowercase letter.");
    }

    if (!/[0-9]/.test(password)) {
      return fail("Password must contain at least one number.");
    }

    if (password !== passwordConfirm) {
      return fail("Passwords do not match.");
    }

    setLoading(true);

    try {
      const result = await api.register({ name, email, password, userType });
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      let redirectPath = "/dashboard";
      if (result.user.user_type === "seller" && result.user.verification_status !== "approved") {
        redirectPath = "/verification-pending";
      } else if (result.user.role === "admin") {
        redirectPath = "/admin";
      }
      navigateTo(redirectPath);
    } catch (error) {
      const message = error.details
        ? Object.values(error.details).flat().join("; ")
        : error.message;
      fail(message || "We couldn't create your account. Please try again.");
    }
  });

  return section;
};

export default RegisterPage;

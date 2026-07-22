import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { loadTemplate } from "../utils/templateLoader.js";

const LoginPage = () => {
  const template = loadTemplate("LoginPage");
  const section = document.createElement("section");
  section.className =
    "mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-elevated animate-scale-in";

  section.innerHTML = template;

  const form = section.querySelector("#login-form");
  const errorEl = section.querySelector("#login-error");
  const errorText = section.querySelector("#login-error-text");
  const submitBtn = section.querySelector("#login-submit");
  const btnText = section.querySelector("#login-btn-text");
  const spinner = section.querySelector("#login-spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.classList.add("hidden");
    submitBtn.disabled = true;
    btnText.textContent = "Loading...";
    spinner.classList.remove("hidden");

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      errorText.textContent = "All fields are required.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Login";
      spinner.classList.add("hidden");
      return;
    }

    try {
      const result = await api.login(email, password);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      const redirectPath = result.user.role === "admin" ? "/admin" : "/dashboard";
      navigateTo(redirectPath);
    } catch (err) {
      errorText.textContent = err.message || "Error logging in.";
      errorEl.classList.remove("hidden");
      submitBtn.disabled = false;
      btnText.textContent = "Login";
      spinner.classList.add("hidden");
    }
  });

  return section;
};

export default LoginPage;

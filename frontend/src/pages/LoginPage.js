import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";

const LoginPage = () => {
  const section = document.createElement("section");
  section.className =
    "mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm";

  section.innerHTML = `
    <h1 class="text-3xl font-semibold text-primary">Iniciar Sesión</h1>
    <form id="login-form" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-text">Correo electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          class="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:border-primary"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-text">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          class="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
      >
        Ingresar
      </button>
    </form>
    <p id="login-error" class="hidden text-sm text-red-600"></p>
    <p class="text-center text-sm text-text/70">
      ¿No tienes cuenta?
      <a href="/registro" class="font-semibold text-primary hover:underline">Regístrate</a>
    </p>
  `;

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
      if (result.user?.role === "admin") {
        navigateTo("/admin");
      } else {
        navigateTo("/");
      }
    } catch (err) {
      errorEl.textContent = err.message || "Error al iniciar sesión.";
      errorEl.classList.remove("hidden");
    }
  });

  return section;
};

export default LoginPage;

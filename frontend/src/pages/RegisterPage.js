// RegisterPage - Página de registro
import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";

const RegisterPage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-white p-8 shadow-sm";

  section.innerHTML = `
    <h1 class="text-3xl font-semibold text-primary">Crear Cuenta</h1>
    <form id="register-form" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-text">Nombre completo</label>
        <input type="text" id="name" name="name" required placeholder="Juan Pérez" class="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:border-primary" />
        <p class="mt-1 text-xs text-text/60">Mínimo 3 caracteres</p>
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-text">Correo electrónico</label>
        <input type="email" id="email" name="email" required placeholder="tu@correo.com" class="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:border-primary" />
        <p class="mt-1 text-xs text-text/60">Usarás esto para iniciar sesión</p>
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-text">Contraseña</label>
        <input type="password" id="password" name="password" required placeholder="••••••••" class="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:border-primary" />
        <p class="mt-1 text-xs text-text/60">Mínimo 6 caracteres</p>
      </div>
      <div>
        <label for="password-confirm" class="block text-sm font-medium text-text">Confirmar contraseña</label>
        <input type="password" id="password-confirm" name="password-confirm" required placeholder="••••••••" class="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-text outline-none focus:border-primary" />
      </div>
      <button type="submit" class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover">Registrarse</button>
    </form>
    <p id="register-error" class="hidden rounded-lg bg-red-50 p-3 text-sm text-red-600"></p>
    <p class="text-center text-sm text-text/70">
      ¿Ya tienes cuenta?
      <a href="/login" class="font-semibold text-primary hover:underline">Inicia sesión</a>
    </p>
  `;

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
      await api.register({ name, email, password });
      navigateTo("/login");
    } catch (err) {
      errorEl.textContent = err.message || "Error al registrarse.";
      errorEl.classList.remove("hidden");
    }
  });

  return section;
};

export default RegisterPage;
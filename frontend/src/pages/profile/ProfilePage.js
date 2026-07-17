import { api } from "../../services/api.js";
import { navigateTo } from "../../router/router.js";
import { getUser, isAuthenticated } from "../../utils/auth.js";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const showMessage = (element, message, type = "success") => {
  element.textContent = message;
  element.className = `mt-3 text-sm ${type === "success" ? "text-accent" : "text-red-600"}`;
};

const ProfilePage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto w-full max-w-5xl";

  if (!isAuthenticated()) {
    navigateTo("/login");
    return section;
  }

  const user = getUser() || {};
  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";

  section.innerHTML = `
    <div class="mb-6 rounded-2xl bg-primary px-6 py-7 text-background shadow-sm sm:px-8">
      <p class="text-sm font-medium text-background/70">Mi cuenta</p>
      <div class="mt-3 flex items-center gap-4">
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-background/15 font-display text-2xl font-bold">${escapeHtml(initial)}</span>
        <div>
          <h1 class="font-display text-3xl font-bold">Configuración del perfil</h1>
          <p class="mt-1 text-sm text-background/75">Administra tus datos, dirección y seguridad.</p>
        </div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside class="self-start rounded-2xl border border-border bg-white p-3 shadow-sm lg:sticky lg:top-6">
        <p class="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-text/50">Configuración</p>
        <nav class="space-y-1" aria-label="Secciones de perfil">
          <button data-section="personal-data" class="profile-nav-btn flex w-full items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-left text-sm font-semibold text-primary">
            <span aria-hidden="true">◉</span> Datos personales
          </button>
          <button data-section="address-data" class="profile-nav-btn flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text/70 transition hover:bg-muted">
            <span aria-hidden="true">⌖</span> Dirección
          </button>
          <button data-section="security-data" class="profile-nav-btn flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text/70 transition hover:bg-muted">
            <span aria-hidden="true">◈</span> Seguridad
          </button>
          <button data-section="danger-zone" class="profile-nav-btn flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
            <span aria-hidden="true">!</span> Eliminar cuenta
          </button>
        </nav>
      </aside>

      <div class="space-y-6">
        <section id="personal-data" class="scroll-mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div class="mb-5">
            <h2 class="font-display text-2xl font-bold text-text">Datos personales</h2>
            <p class="mt-1 text-sm text-text/60">Esta información identifica tu cuenta en MUISKA.</p>
          </div>
          <form id="profile-form" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-text">Nombre completo</label>
              <input type="text" id="name" name="name" value="${escapeHtml(user.name || "")}" required minlength="3" class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-text">Correo electrónico</label>
              <input type="email" id="email" name="email" value="${escapeHtml(user.email || "")}" required class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover">Guardar datos</button>
            <p id="profile-message" class="hidden"></p>
          </form>
        </section>

        <section id="address-data" class="scroll-mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div class="mb-5">
            <h2 class="font-display text-2xl font-bold text-text">Dirección</h2>
            <p class="mt-1 text-sm text-text/60">Guarda tu dirección para facilitar la coordinación de entregas.</p>
          </div>
          <form id="address-form" class="space-y-4">
            <div>
              <label for="address" class="block text-sm font-medium text-text">Dirección de contacto</label>
              <input type="text" id="address" name="address" required maxlength="255" placeholder="Ej. Calle 10 # 20-30, Bogotá" class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
              <p class="mt-1 text-xs text-text/50">Solo estará disponible en tu perfil para que puedas mantenerla actualizada.</p>
            </div>
            <button type="submit" class="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90">Guardar dirección</button>
            <p id="address-message" class="hidden"></p>
          </form>
        </section>

        <section id="security-data" class="scroll-mt-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div class="mb-5">
            <h2 class="font-display text-2xl font-bold text-text">Seguridad</h2>
            <p class="mt-1 text-sm text-text/60">Actualiza tu contraseña periódicamente para proteger tu cuenta.</p>
          </div>
          <form id="password-form" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-text">Contraseña actual</label>
              <input type="password" id="currentPassword" name="currentPassword" required class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label for="newPassword" class="block text-sm font-medium text-text">Nueva contraseña</label>
              <input type="password" id="newPassword" name="newPassword" required minlength="6" class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-text">Confirmar nueva contraseña</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
            </div>
            <button type="submit" class="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20">Actualizar contraseña</button>
            <p id="password-message" class="hidden"></p>
          </form>
        </section>

        <section id="danger-zone" class="scroll-mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h2 class="font-display text-2xl font-bold text-text">Zona de peligro</h2>
          <p class="mt-1 text-sm text-text/70">Al eliminar tu cuenta se borrarán permanentemente tus publicaciones y datos.</p>
          <button id="delete-account-btn" class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Eliminar mi cuenta</button>
        </section>
      </div>
    </div>
  `;

  const profileForm = section.querySelector("#profile-form");
  const addressForm = section.querySelector("#address-form");
  const passwordForm = section.querySelector("#password-form");
  const profileMessage = section.querySelector("#profile-message");
  const addressMessage = section.querySelector("#address-message");
  const passwordMessage = section.querySelector("#password-message");

  api
    .getMe()
    .then((profile) => {
      profileForm.name.value = profile.name || "";
      profileForm.email.value = profile.email || "";
      addressForm.address.value = profile.address || "";
    })
    .catch(() => {});

  section.querySelectorAll(".profile-nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      section.querySelectorAll(".profile-nav-btn").forEach((item) => {
        item.className = "profile-nav-btn flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-text/70 transition hover:bg-muted";
      });
      button.className = "profile-nav-btn flex w-full items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-left text-sm font-semibold text-primary";
      section.querySelector(`#${button.dataset.section}`).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const updatedUser = await api.updateProfile({
        name: profileForm.name.value,
        email: profileForm.email.value,
      });
      localStorage.setItem("user", JSON.stringify({ ...getUser(), ...updatedUser }));
      showMessage(profileMessage, "Datos personales actualizados correctamente.");
    } catch (error) {
      showMessage(profileMessage, error.message || "No se pudieron actualizar tus datos.", "error");
    }
  });

  addressForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const updatedUser = await api.updateAddress(addressForm.address.value);
      localStorage.setItem("user", JSON.stringify({ ...getUser(), ...updatedUser }));
      showMessage(addressMessage, "Dirección actualizada correctamente.");
    } catch (error) {
      showMessage(addressMessage, error.message || "No se pudo actualizar la dirección.", "error");
    }
  });

  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword.value !== passwordForm.confirmPassword.value) {
      showMessage(passwordMessage, "Las contraseñas no coinciden.", "error");
      return;
    }
    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword.value,
        newPassword: passwordForm.newPassword.value,
      });
      passwordForm.reset();
      showMessage(passwordMessage, "Contraseña actualizada correctamente.");
    } catch (error) {
      showMessage(passwordMessage, error.message || "No se pudo actualizar la contraseña.", "error");
    }
  });

  section.querySelector("#delete-account-btn").addEventListener("click", async () => {
    if (!confirm("¿Eliminar tu cuenta? Esta acción borrará todas tus publicaciones y no se puede deshacer.")) return;
    try {
      await api.request("/auth/me", { method: "DELETE" });
      api.logout();
      navigateTo("/");
    } catch (error) {
      alert(error.message || "No se pudo eliminar la cuenta.");
    }
  });

  return section;
};

export default ProfilePage;

import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated, sessionStore } from "../utils/auth.js";

const ProfilePage = () => {
  const section = document.createElement("section");
  section.className = "mx-auto max-w-2xl space-y-6";

  if (!isAuthenticated()) {
    navigateTo("/login");
    return section;
  }

  const user = sessionStore.getUser();

  section.innerHTML = `
    <div class="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <h1 class="text-3xl font-semibold text-primary">Mi Perfil</h1>
          <p class="text-sm text-text/60">Gestiona tu información personal y seguridad</p>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-6">
      <div class="border-b border-border pb-6">
        <h2 class="text-lg font-semibold text-text mb-4">Información Personal</h2>
        <form id="profile-form" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-text">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value="${user.name || ""}"
              required
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-text">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value="${user.email || ""}"
              required
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div class="flex gap-3">
            <button
              type="submit"
              class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              Guardar cambios
            </button>
            <span id="profile-message" class="flex items-center text-sm text-text/60 hidden"></span>
          </div>
        </form>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-text mb-4">Cambiar Contraseña</h2>
        <form id="password-form" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-text">Contraseña actual</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label for="newPassword" class="block text-sm font-medium text-text">Nueva contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              minlength="6"
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
            <p class="mt-1 text-xs text-text/50">Mínimo 6 caracteres</p>
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-text">Confirmar nueva contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              class="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <div class="flex gap-3">
            <button
              type="submit"
              class="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/20"
            >
              Actualizar contraseña
            </button>
            <span id="password-message" class="flex items-center text-sm text-text/60 hidden"></span>
          </div>
        </form>
      </div>

      <div class="border-t border-border pt-6">
        <h2 class="text-lg font-semibold text-text mb-4">Zona de Peligro</h2>
        <p class="text-sm text-text/70 mb-4">Eliminar tu cuenta es irreversible. Se borrarán todas tus publicaciones y datos.</p>
        <button
          id="delete-account-btn"
          class="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
        >
          Eliminar mi cuenta
        </button>
      </div>
    </div>
  `;

  const profileForm = section.querySelector("#profile-form");
  const profileMessage = section.querySelector("#profile-message");
  const passwordForm = section.querySelector("#password-form");
  const passwordMessage = section.querySelector("#password-message");
  const deleteBtn = section.querySelector("#delete-account-btn");

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    profileMessage.classList.add("hidden");
    profileMessage.textContent = "";

    const formData = new FormData(profileForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
    };

    try {
      const updatedUser = await api.updateProfile(data);
      sessionStore.setUser(updatedUser);
      profileMessage.textContent = "Perfil actualizado correctamente";
      profileMessage.className = "flex items-center text-sm text-green-600";
      profileMessage.classList.remove("hidden");
    } catch (err) {
      profileMessage.textContent = err.message || "Error al actualizar perfil";
      profileMessage.className = "flex items-center text-sm text-red-600";
      profileMessage.classList.remove("hidden");
    }
  });

  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    passwordMessage.classList.add("hidden");
    passwordMessage.textContent = "";

    const formData = new FormData(passwordForm);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      passwordMessage.textContent = "Las contraseñas no coinciden";
      passwordMessage.className = "flex items-center text-sm text-red-600";
      passwordMessage.classList.remove("hidden");
      return;
    }

    try {
      await api.changePassword({ currentPassword, newPassword });
      passwordForm.reset();
      passwordMessage.textContent = "Contraseña actualizada correctamente";
      passwordMessage.className = "flex items-center text-sm text-green-600";
      passwordMessage.classList.remove("hidden");
    } catch (err) {
      passwordMessage.textContent = err.message || "Error al cambiar contraseña";
      passwordMessage.className = "flex items-center text-sm text-red-600";
      passwordMessage.classList.remove("hidden");
    }
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      return;
    }
    if (!confirm("Última confirmación: Se eliminarán TODAS tus publicaciones y datos. ¿Continuar?")) {
      return;
    }

    try {
      await api.request("/auth/me", { method: "DELETE" });
      sessionStore.logout();
      navigateTo("/");
    } catch (err) {
      alert(err.message || "Error al eliminar cuenta");
    }
  });

  return section;
};

export default ProfilePage;
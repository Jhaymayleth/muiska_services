import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated, sessionStore } from "../utils/auth.js";
import { loadTemplate } from "../utils/templateLoader.js";

const ProfilePage = () => {
  const template = loadTemplate("ProfilePage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-2xl space-y-6";

  if (!isAuthenticated()) {
    navigateTo("/login");
    return section;
  }

  const user = sessionStore.getUser();

  section.innerHTML = template
    .replace("{{userName}}", user.name || "")
    .replace("{{userEmail}}", user.email || "");

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
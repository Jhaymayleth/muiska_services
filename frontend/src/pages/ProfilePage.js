import { api } from "../services/api.js";
import { navigateTo } from "../router/router.js";
import { isAuthenticated, sessionStore } from "../utils/auth.js";
import { loadTemplate } from "../utils/templateLoader.js";
import { createBarrioAutocomplete } from "../components/BarrioAutocomplete.js";

const emptyToNull = (value) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed === "" ? null : trimmed;
};

const coordinateOrNull = (value) => {
  if (value === null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const ProfilePage = async () => {
  const template = loadTemplate("ProfilePage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-2xl space-y-6";

  if (!isAuthenticated()) {
    navigateTo("/login");
    return section;
  }

  const user = sessionStore.getUser();

  // Los valores se asignan por JS (no por interpolación) para no romper el HTML
  // con nombres que contengan comillas o etiquetas.
  section.innerHTML = template.replace("{{userName}}", "").replace("{{userEmail}}", "");

  const profileForm = section.querySelector("#profile-form");
  const profileMessage = section.querySelector("#profile-message");
  const passwordForm = section.querySelector("#password-form");
  const passwordMessage = section.querySelector("#password-message");
  const deleteBtn = section.querySelector("#delete-account-btn");
  const locateBtn = section.querySelector("#locate-btn");

  const barrioAutocomplete = createBarrioAutocomplete({
    placeholder: "Search your neighborhood",
  });
  section.querySelector("#neighborhood-autocomplete").appendChild(barrioAutocomplete.element);

  let currentNeighborhoodName = "";

  const fillProfile = (data) => {
    profileForm.name.value = data.name || "";
    profileForm.email.value = data.email || "";
    profileForm.phone.value = data.phone || "";
    profileForm.whatsapp.value = data.whatsapp || "";
    profileForm.bio.value = data.bio || "";
    profileForm.lat.value = data.lat ?? "";
    profileForm.lng.value = data.lng ?? "";
    barrioAutocomplete.setValue(data.neighborhood_id, currentNeighborhoodName);
  };

  fillProfile(user || {});

  // El usuario en sesión puede venir de localStorage con datos básicos: se
  // refresca el perfil completo desde el backend.
  try {
    const me = await api.getMe();
    sessionStore.setUser(me);
    if (me.neighborhood_id) {
      try {
        const neighborhood = await api.getNeighborhood(me.neighborhood_id);
        currentNeighborhoodName = neighborhood?.name || "";
      } catch {
        currentNeighborhoodName = "";
      }
    }
    fillProfile(me);
  } catch {
    // Sin conexión se conservan los datos de la sesión local.
  }

  locateBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      profileMessage.textContent = "Geolocation is not available in this browser";
      profileMessage.className = "flex items-center text-sm text-red-600";
      profileMessage.classList.remove("hidden");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        profileForm.lat.value = position.coords.latitude.toFixed(6);
        profileForm.lng.value = position.coords.longitude.toFixed(6);
      },
      () => {
        profileMessage.textContent = "Could not get your location";
        profileMessage.className = "flex items-center text-sm text-red-600";
        profileMessage.classList.remove("hidden");
      },
    );
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    profileMessage.classList.add("hidden");
    profileMessage.textContent = "";

    const formData = new FormData(profileForm);
    const data = {
      name: emptyToNull(formData.get("name")),
      email: emptyToNull(formData.get("email")),
      phone: emptyToNull(formData.get("phone")),
      whatsapp: emptyToNull(formData.get("whatsapp")),
      bio: emptyToNull(formData.get("bio")),
      neighborhoodId: barrioAutocomplete.getValue() || null,
      lat: coordinateOrNull(formData.get("lat")),
      lng: coordinateOrNull(formData.get("lng")),
    };

    if (!data.name || !data.email) {
      profileMessage.textContent = "Name and email are required";
      profileMessage.className = "flex items-center text-sm text-red-600";
      profileMessage.classList.remove("hidden");
      return;
    }

    try {
      const updatedUser = await api.updateProfile(data);
      sessionStore.setUser(updatedUser);
      currentNeighborhoodName = barrioAutocomplete.getTextValue();
      fillProfile(updatedUser);
      profileMessage.textContent = "Profile updated successfully";
      profileMessage.className = "flex items-center text-sm text-green-600";
      profileMessage.classList.remove("hidden");
    } catch (err) {
      profileMessage.textContent = err.message || "Error updating profile";
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
      passwordMessage.textContent = "Passwords do not match";
      passwordMessage.className = "flex items-center text-sm text-red-600";
      passwordMessage.classList.remove("hidden");
      return;
    }

    try {
      await api.changePassword({ currentPassword, newPassword });
      passwordForm.reset();
      passwordMessage.textContent = "Password updated successfully";
      passwordMessage.className = "flex items-center text-sm text-green-600";
      passwordMessage.classList.remove("hidden");
    } catch (err) {
      passwordMessage.textContent = err.message || "Error changing password";
      passwordMessage.className = "flex items-center text-sm text-red-600";
      passwordMessage.classList.remove("hidden");
    }
  });

  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    if (!confirm("Final confirmation: ALL your publications and data will be deleted. Continue?")) {
      return;
    }

    try {
      await api.request("/auth/me", { method: "DELETE" });
      sessionStore.logout();
      navigateTo("/");
    } catch (err) {
      alert(err.message || "Error deleting account");
    }
  });

  return section;
};

export default ProfilePage;
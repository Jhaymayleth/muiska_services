import { loadTemplate } from "../utils/templateLoader.js";
import { sessionStore } from "../state/session.store.js";
import { navigateTo } from "../router/router.js";
import { api } from "../services/api.js";

const VerificacionPendientePage = () => {
  const template = loadTemplate("VerificacionPendientePage");
  const section = document.createElement("section");
  section.className = "flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12";
  section.innerHTML = template;

  const reintentarBtn = section.querySelector("#reintentar-btn");
  const irInicioBtn = section.querySelector("#ir-inicio-btn");

  const checkVerificationStatus = async () => {
    try {
      const result = await api.getMyVerificationStatus();
      if (result.estado?.estado_verificacion === "aprobado") {
        sessionStore.setUser({ ...sessionStore.getUser(), estado_verificacion: "aprobado", badge_verificado: true });
        navigateTo("/dashboard");
        return true;
      }
      if (result.estado?.estado_verificacion === "rechazado") {
        const motivoEl = section.querySelector("#motivo-rechazo");
        const mensajeEl = section.querySelector("#mensaje-rechazo");
        if (motivoEl && mensajeEl && result.estado.motivo_rechazo_verificacion) {
          motivoEl.textContent = result.estado.motivo_rechazo_verificacion;
          mensajeEl.classList.remove("hidden");
        }
      }
    } catch (error) {
      console.error("Error verificando estado:", error);
    }
    return false;
  };

  reintentarBtn.addEventListener("click", async () => {
    const verified = await checkVerificationStatus();
    if (!verified) {
      alert("Tu perfil aún está en verificación. Te notificaremos cuando esté listo.");
    }
  });

  irInicioBtn.addEventListener("click", () => {
    navigateTo("/");
  });

  checkVerificationStatus();

  return section;
};

export default VerificacionPendientePage;
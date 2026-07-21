import { loadTemplate } from "../utils/templateLoader.js";
import { sessionStore } from "../state/session.store.js";
import { navigateTo } from "../router/router.js";
import { api } from "../services/api.js";

const VerificationPendingPage = () => {
  const template = loadTemplate("VerificationPendingPage");
  const section = document.createElement("section");
  section.className = "flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12";
  section.innerHTML = template;

  const retryBtn = section.querySelector("#retry-btn");
  const homeBtn = section.querySelector("#home-btn");

  const checkVerificationStatus = async () => {
    try {
      const result = await api.getMyVerificationStatus();
      if (result.status?.verification_status === "approved") {
        sessionStore.setUser({ ...sessionStore.getUser(), verification_status: "approved", is_verified_badge: true });
        navigateTo("/dashboard");
        return true;
      }
      if (result.status?.verification_status === "rejected") {
        const reasonEl = section.querySelector("#rejection-reason");
        const messageEl = section.querySelector("#rejection-message");
        if (reasonEl && messageEl && result.status.rejection_reason) {
          reasonEl.textContent = result.status.rejection_reason;
          messageEl.classList.remove("hidden");
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
    return false;
  };

  retryBtn.addEventListener("click", async () => {
    const verified = await checkVerificationStatus();
    if (!verified) {
      alert("Your profile is still under verification. We'll notify you when it's ready.");
    }
  });

  homeBtn.addEventListener("click", () => {
    navigateTo("/");
  });

  checkVerificationStatus();

  return section;
};

export default VerificationPendingPage;
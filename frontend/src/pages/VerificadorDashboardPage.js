import { loadTemplate } from "../utils/templateLoader.js";
import { getUser } from "../utils/auth.js";
import { api } from "../services/api.js";
import { showToast } from "../state/notification.store.js";

const VerificadorDashboardPage = () => {
  const template = loadTemplate("VerificadorDashboardPage");
  const section = document.createElement("section");
  section.className = "mx-auto max-w-6xl px-4 py-8";
  section.innerHTML = template;

  const user = getUser();
  const verifierNameEl = section.querySelector("#verifier-name");
  if (verifierNameEl) {
    verifierNameEl.textContent = user?.name || "Verifier";
  }

  const tabs = section.querySelectorAll("#verifier-tabs [data-tab]");
  const tabPanels = section.querySelectorAll("[data-tab-panel]");
  const profilesList = section.querySelector("#profiles-list");
  const publicationsList = section.querySelector("#publications-list");
  const profilesCount = section.querySelector("#profiles-count");
  const publicationsCount = section.querySelector("#publications-count");

  let currentTab = "profiles";
  let currentSubtab = "verifications";

  const switchTab = (tabName) => {
    if (currentTab === tabName) return;
    currentTab = tabName;
    tabs.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("border-primary", isActive);
      btn.classList.toggle("text-primary", isActive);
      btn.classList.toggle("border-transparent", !isActive);
      btn.classList.toggle("text-gray-500", !isActive);
      btn.classList.toggle("hover:border-gray-300", !isActive);
      btn.classList.toggle("hover:text-gray-700", !isActive);
    });
    tabPanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.tabPanel !== tabName);
    });
    if (tabName === "profiles") loadPendingProfiles();
    if (tabName === "publications") loadPendingPublications();
    if (tabName === "history") loadHistory();
  };

  const switchSubtab = (subtabName) => {
    if (currentSubtab === subtabName) return;
    currentSubtab = subtabName;
    const subtabBtns = section.querySelectorAll("#history-subtabs [data-subtab]");
    const historyPanels = section.querySelectorAll("[data-history-panel]");
    subtabBtns.forEach((btn) => {
      const isActive = btn.dataset.subtab === subtabName;
      btn.classList.toggle("border-primary", isActive);
      btn.classList.toggle("text-primary", isActive);
      btn.classList.toggle("border-transparent", !isActive);
      btn.classList.toggle("text-gray-500", !isActive);
      btn.classList.toggle("hover:border-gray-300", !isActive);
      btn.classList.toggle("hover:text-gray-700", !isActive);
    });
    historyPanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.historyPanel !== subtabName);
    });
    if (subtabName === "verifications") loadVerificationHistory();
    if (subtabName === "moderations") loadModerationHistory();
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  const subtabs = section.querySelectorAll("#history-subtabs [data-subtab]");
  subtabs.forEach((btn) => {
    btn.addEventListener("click", () => switchSubtab(btn.dataset.subtab));
  });

  const loadPendingProfiles = async () => {
    if (!profilesList) return;
    profilesList.innerHTML = '<p class="text-gray-500">Loading profiles...</p>';
    try {
      const res = await api.getPendingVerifications();
      const verifications = res.verifications || [];
      if (profilesCount) profilesCount.textContent = `${verifications.length} pending`;
      if (verifications.length === 0) {
        profilesList.innerHTML = '<p class="text-gray-500">No profiles pending verification.</p>';
        return;
      }
      profilesList.innerHTML = verifications
        .map((v) => `
          <div class="rounded-lg border border-gray-200 p-4" data-verification-id="${v.id}">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">${v.name || "No name"}</h3>
                <p class="text-sm text-gray-600">${v.email || ""}</p>
                ${v.phone ? `<p class="text-sm text-gray-600">Phone: ${v.phone}</p>` : ""}
                ${v.whatsapp ? `<p class="text-sm text-gray-600">WhatsApp: ${v.whatsapp}</p>` : ""}
                ${v.neighborhood_name ? `<p class="text-sm text-gray-600">Neighborhood: ${v.neighborhood_name} (${v.locality})</p>` : ""}
                ${v.bio ? `<p class="text-sm text-gray-700 mt-2">${v.bio}</p>` : ""}
                ${v.rejection_reason ? `<p class="text-sm text-red-600 mt-1">Previous rejection: ${v.rejection_reason}</p>` : ""}
              </div>
              <div class="ml-4 flex flex-col gap-2">
                <button
                  data-action="approve"
                  data-id="${v.id}"
                  class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  data-action="reject"
                  data-id="${v.id}"
                  class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        `)
        .join("");
    } catch (err) {
      profilesList.innerHTML = `<p class="text-red-600">Error loading profiles: ${err.message}</p>`;
    }
  };

  const loadPendingPublications = async () => {
    if (!publicationsList) return;
    publicationsList.innerHTML = '<p class="text-gray-500">Loading publications...</p>';
    try {
      const res = await api.getPendingPublications();
      const pubs = res.data || [];
      if (publicationsCount) publicationsCount.textContent = `${pubs.length} pending`;
      if (pubs.length === 0) {
        publicationsList.innerHTML = '<p class="text-gray-500">No publications pending moderation.</p>';
        return;
      }
      publicationsList.innerHTML = pubs
        .map((p) => `
          <div class="rounded-lg border border-gray-200 p-4" data-publication-id="${p.id}">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">${p.title || "No title"}</h3>
                <p class="text-sm text-gray-600">${p.category || "Uncategorized"}</p>
                <p class="text-sm text-gray-600">Price: $${p.price || 0}</p>
                ${p.description ? `<p class="text-sm text-gray-700 mt-2 line-clamp-2">${p.description}</p>` : ""}
                ${p.location ? `<p class="text-sm text-gray-600 mt-1">Location: ${p.location}</p>` : ""}
                ${p.rejection_reason ? `<p class="text-sm text-red-600 mt-1">Previous rejection: ${p.rejection_reason}</p>` : ""}
              </div>
              <div class="ml-4 flex flex-col gap-2">
                <button
                  data-action="approve-pub"
                  data-id="${p.id}"
                  class="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  data-action="reject-pub"
                  data-id="${p.id}"
                  class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        `)
        .join("");
    } catch (err) {
      publicationsList.innerHTML = `<p class="text-red-600">Error loading publications: ${err.message}</p>`;
    }
  };

  const loadVerificationHistory = async () => {
    const panel = section.querySelector('[data-history-panel="verifications"]');
    if (!panel) return;
    panel.innerHTML = '<p class="text-gray-500">Loading...</p>';
    try {
      const res = await api.getMyVerificationHistory();
      const verifications = res.verifications || [];
      if (verifications.length === 0) {
        panel.innerHTML = '<p class="text-gray-500">No verification history.</p>';
        return;
      }
      panel.innerHTML = verifications
        .map((v) => `
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="flex items-center justify-between">
              <span class="font-medium">${v.name || "No name"}</span>
              <span class="text-xs font-medium ${v.status === "approved" ? "text-green-600" : "text-red-600"}">${v.status}</span>
            </div>
            <p class="text-sm text-gray-600">${v.email || ""}</p>
            ${v.reason ? `<p class="text-sm text-gray-600">Reason: ${v.reason}</p>` : ""}
            <p class="text-xs text-gray-500">${new Date(v.created_at).toLocaleString()}</p>
          </div>
        `)
        .join("");
    } catch (err) {
      panel.innerHTML = `<p class="text-red-600">Error: ${err.message}</p>`;
    }
  };

  const loadModerationHistory = async () => {
    const panel = section.querySelector('[data-history-panel="moderations"]');
    if (!panel) return;
    panel.innerHTML = '<p class="text-gray-500">Loading...</p>';
    try {
      const res = await api.getMyModerations();
      const moderations = res || [];
      if (moderations.length === 0) {
        panel.innerHTML = '<p class="text-gray-500">No moderation history.</p>';
        return;
      }
      panel.innerHTML = moderations
        .map((m) => `
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="flex items-center justify-between">
              <span class="font-medium">${m.title || "No title"}</span>
              <span class="text-xs font-medium ${m.action === "approved" ? "text-green-600" : "text-red-600"}">${m.action}</span>
            </div>
            ${m.reason ? `<p class="text-sm text-gray-600">Reason: ${m.reason}</p>` : ""}
            <p class="text-xs text-gray-500">${new Date(m.created_at).toLocaleString()}</p>
          </div>
        `)
        .join("");
    } catch (err) {
      panel.innerHTML = `<p class="text-red-600">Error: ${err.message}</p>`;
    }
  };

  const loadHistory = () => {
    loadVerificationHistory();
  };

  // Event delegation for approve/reject buttons
  section.addEventListener("click", async (e) => {
    const approveBtn = e.target.closest("[data-action='approve']");
    const rejectBtn = e.target.closest("[data-action='reject']");
    const approvePubBtn = e.target.closest("[data-action='approve-pub']");
    const rejectPubBtn = e.target.closest("[data-action='reject-pub']");

    if (approveBtn) {
      const id = approveBtn.dataset.id;
      try {
        await api.approveVerification(id);
        showToast("Profile approved successfully", "success");
        loadPendingProfiles();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      }
    }

    if (rejectBtn) {
      const id = rejectBtn.dataset.id;
      const reason = prompt("Enter rejection reason:");
      if (!reason || reason.trim() === "") return;
      try {
        await api.rejectVerification(id, reason.trim());
        showToast("Profile rejected", "success");
        loadPendingProfiles();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      }
    }

    if (approvePubBtn) {
      const id = approvePubBtn.dataset.id;
      try {
        await api.approvePublication(id);
        showToast("Publication approved", "success");
        loadPendingPublications();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      }
    }

    if (rejectPubBtn) {
      const id = rejectPubBtn.dataset.id;
      const reason = prompt("Enter rejection reason:");
      if (!reason || reason.trim() === "") return;
      try {
        await api.rejectPublication(id, reason.trim());
        showToast("Publication rejected", "success");
        loadPendingPublications();
      } catch (err) {
        showToast(`Error: ${err.message}`, "error");
      }
    }
  });

  // Initial load
  loadPendingProfiles();

  return section;
};

export default VerificadorDashboardPage;

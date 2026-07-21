/**
 * AdminPage - Orquestador principal del panel de administración
 * Coordina tabs y delega lógica a módulos especializados
 */

import { navigateTo } from "../../router/router.js";
import { loadTemplate } from "../../utils/templateLoader.js";
import { getUser } from "../../utils/auth.js";
import { escapeHtml } from "../../utils/helpers.js";
import { AdminDashboard } from "./AdminDashboard.js";
import { AdminPublications } from "./AdminPublications.js";
import { AdminCategories } from "./AdminCategories.js";
import { AdminUsers } from "./AdminUsers.js";

/**
 * Inicializa y renderiza el panel de administración completo
 * @returns {HTMLElement} Elemento section con el panel admin
 */
export default function AdminPage() {
  const section = document.createElement("section");
  section.className = "admin-page";

  // Verificar autenticación y rol admin
  const user = getUser();
  if (!user || user.role !== "admin") {
    navigateTo("/dashboard");
    return section;
  }

  // Cargar template base
  const template = loadTemplate("AdminPage");
  section.innerHTML = template
    .replace("{{adminName}}", escapeHtml(user.name || "Administrator"));

  // Elementos de navegación
  const tabButtons = section.querySelectorAll(".admin-tabs__btn");
  const panels = {
    dashboard: section.querySelector("#panel-dashboard"),
    publications: section.querySelector("#panel-publications"),
    categories: section.querySelector("#panel-categories"),
    users: section.querySelector("#panel-users"),
  };

  // Estado actual
  let currentTab = "dashboard";
  let initializedTabs = {
    dashboard: false,
    publications: false,
    categories: false,
    users: false,
  };

  /**
   * Cambia tab activa
   */
  const switchTab = (tabName) => {
    if (currentTab === tabName) return;

    // Actualizar botones
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("admin-tabs__btn--active", isActive);
      btn.setAttribute("aria-selected", isActive);
    });

    // Mostrar/ocultar paneles
    Object.entries(panels).forEach(([name, panel]) => {
      if (!panel) return;
      const show = name === tabName;
      panel.hidden = !show;
      if (show) panel.classList.add("admin-panel--active");
      else panel.classList.remove("admin-panel--active");
    });

    // Inicializar módulo del tab si es primera vez
    if (!initializedTabs[tabName]) {
      initializeTab(tabName);
      initializedTabs[tabName] = true;
    }

    currentTab = tabName;
  };

  /**
   * Inicializa módulo específico del tab
   */
  const initializeTab = (tabName) => {
    const panel = panels[tabName];
    if (!panel) return;

    switch (tabName) {
      case "dashboard":
        AdminDashboard.init(panel);
        break;
      case "publications":
        AdminPublications.init(panel);
        break;
      case "categories":
        AdminCategories.init(panel);
        break;
      case "users":
        panel.dataset.currentUserId = user.id;
        AdminUsers.init(panel);
        break;
    }
  };

  // Event listeners para tabs
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Inicializar tab por defecto
  initializeTab("dashboard");
  initializedTabs.dashboard = true;

  return section;
};
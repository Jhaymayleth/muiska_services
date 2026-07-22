/**
 * Utilidades compartidas - Helpers para formateo, sanitización, etc.
 */

// Formatear número con separadores de miles y decimales (COP)
export function formatNumber(value, decimals = 2) {
  const num = Number(value) || 0;
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Formatear fecha para locale es-CO
export function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

// Escapar HTML para prevenir XSS
export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', "&#34;")
    .replaceAll("'", "&#039;");
}

// Obtener iniciales de un nombre
export function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Generar ID único simple
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Debounce para inputs de búsqueda
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Clase para manejo de estados de carga
export class LoadingState {
  constructor(element, loadingHtml = '<span class="admin-spinner"></span>Loading...') {
    this.element = element;
    this.originalHtml = element?.innerHTML || "";
    this.loadingHtml = loadingHtml;
  }

  show() {
    if (this.element) this.element.innerHTML = this.loadingHtml;
  }

  hide() {
    if (this.element) this.element.innerHTML = this.originalHtml;
  }

  set(html) {
    if (this.element) this.element.innerHTML = html;
  }
}
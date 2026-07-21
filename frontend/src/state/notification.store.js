// Almacén de notificaciones
import { api } from "../services/api.js";

export const notificationStore = {
  notifications: [],
  unreadCount: 0,
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(l => l(this.unreadCount));
    window.dispatchEvent(new CustomEvent("notifications:updated", { 
      detail: { count: this.unreadCount } 
    }));
  },

  async fetchFromServer() {
    try {
      const res = await api.get("/notificaciones?limit=20&unreadOnly=true");
      this.notifications = res.notifications || [];
      this.unreadCount = res.unreadCount || 0;
      this.notify();
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    }
  },

  getUnreadCount() {
    return this.unreadCount;
  },

  getAll() {
    return this.notifications;
  },

  async markAsRead(id) {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      const notif = this.notifications.find(n => n.id === id);
      if (notif && !notif.leida) {
        notif.leida = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notify();
      }
    } catch (err) {
      console.error("Error marcando como leída:", err);
    }
  },

  async markAllAsRead() {
    try {
      await api.post("/notificaciones/leer-todas");
      this.notifications.forEach(n => n.leida = true);
      this.unreadCount = 0;
      this.notify();
    } catch (err) {
      console.error("Error marcando todas como leídas:", err);
    }
  }
};

// Función para mostrar toast simple
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
    type === "success" ? "bg-green-600 text-white" :
    type === "error" ? "bg-red-600 text-white" :
    "bg-blue-600 text-white"
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
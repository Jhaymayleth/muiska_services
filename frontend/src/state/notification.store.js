// Notification store
import { api } from "../services/api.js";

const FETCH_COOLDOWN_MS = 30000;

export const notificationStore = {
  notifications: [],
  unreadCount: 0,
  listeners: [],
  lastFetched: 0,

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
    const now = Date.now();
    if (now - this.lastFetched < FETCH_COOLDOWN_MS) return;
    this.lastFetched = now;
    try {
      const res = await api.request("/notifications?limit=20&unreadOnly=true");
      this.notifications = res.notifications || [];
      this.unreadCount = res.unreadCount || 0;
      this.notify();
    } catch (err) {
      console.error("Error loading notifications:", err);
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
      await api.request(`/notifications/${id}/read`, { method: "PATCH" });
      const notif = this.notifications.find(n => n.id === id);
      if (notif && !notif.is_read) {
        notif.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.notify();
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  },

  async markAllAsRead() {
    try {
      await api.request("/notifications/read-all", { method: "POST" });
      this.notifications.forEach(n => n.is_read = true);
      this.unreadCount = 0;
      this.notify();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }
};

// Simple toast function
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
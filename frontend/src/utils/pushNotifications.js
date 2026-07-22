import { api } from "../services/api.js";
import { sessionStore } from "../state/session.store.js";

export async function initPushNotifications() {
  if (!("Notification" in window) || !("PushManager" in window) || !sessionStore.isAuthenticated()) {
    return;
  }

  if (Notification.permission === "denied") return;

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const keyResult = await api.getPushPublicKey();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyResult.publicKey,
    });

    await api.subscribePush({
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
      auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))),
    });
  } catch {
    // silently fail
  }
}

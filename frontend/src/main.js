import "./styles/globals.css";
import "./styles/scss/main.scss";
import App from "./App.js";
import { initPushNotifications } from "./utils/pushNotifications.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("/sw.js");
    await initPushNotifications();
  });
}

const appRoot = document.getElementById("app");
appRoot?.replaceChildren(App());

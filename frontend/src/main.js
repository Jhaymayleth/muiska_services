import "./styles/globals.css";
import App from "./App.js";

const appRoot = document.createElement("div");
appRoot.id = "app";
document.body.replaceChildren(appRoot);
appRoot.replaceChildren(App());

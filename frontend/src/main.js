import "./styles/globals.css";
import App from "./App.js";

const appRoot = document.getElementById("app");
appRoot?.replaceChildren(App());

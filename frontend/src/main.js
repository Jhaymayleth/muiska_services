import "./styles/globals.css";
import "./styles/scss/main.scss";
import App from "./App.js";

const appRoot = document.getElementById("app");
appRoot?.replaceChildren(App());

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { APP_BASE } from "./constants";
import "./styles.css";

if ("storage" in navigator && "persist" in navigator.storage) {
  navigator.storage.persist().catch(() => undefined);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${APP_BASE}service-worker.js`).catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

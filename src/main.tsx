import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

if ("storage" in navigator && "persist" in navigator.storage) {
  navigator.storage.persist().catch(() => undefined);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/workout-app/service-worker.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

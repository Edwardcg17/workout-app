const STORAGE_KEY = "workout-demo-set-count";

const setCount = document.querySelector("#set-count");
const logSet = document.querySelector("#log-set");
const resetDemo = document.querySelector("#reset-demo");
const connectionStatus = document.querySelector("#connection-status");

function readCount() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  const parsed = Number.parseInt(saved || "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function writeCount(nextCount) {
  window.localStorage.setItem(STORAGE_KEY, String(nextCount));
  setCount.textContent = String(nextCount);
}

function updateConnectionStatus() {
  connectionStatus.textContent = window.navigator.onLine ? "Online" : "Offline";
}

logSet.addEventListener("click", () => {
  writeCount(readCount() + 1);
});

resetDemo.addEventListener("click", () => {
  writeCount(0);
});

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

writeCount(readCount());
updateConnectionStatus();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      connectionStatus.textContent = "Cache pending";
    });
  });
}

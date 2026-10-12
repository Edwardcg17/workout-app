const STORAGE_KEY = "workout-demo-set-count";
const APP_STORAGE_PREFIX = "workout-";
const BACKUP_VERSION = 1;

const setCount = document.querySelector("#set-count");
const logSet = document.querySelector("#log-set");
const resetDemo = document.querySelector("#reset-demo");
const connectionStatus = document.querySelector("#connection-status");
const exportBackup = document.querySelector("#export-backup");
const importBackup = document.querySelector("#import-backup");
const backupStatus = document.querySelector("#backup-status");

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

function setBackupStatus(message) {
  backupStatus.textContent = message;
}

function getAppStorageSnapshot() {
  const data = {};

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (key && key.startsWith(APP_STORAGE_PREFIX)) {
      data[key] = window.localStorage.getItem(key);
    }
  }

  return data;
}

function downloadBackupFile() {
  const backup = {
    app: "workout-pwa",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: getAppStorageSnapshot()
  };
  const backupText = JSON.stringify(backup, null, 2);
  const backupBlob = new Blob([backupText], { type: "application/json" });
  const backupUrl = URL.createObjectURL(backupBlob);
  const today = new Date().toISOString().slice(0, 10);
  const downloadLink = document.createElement("a");

  downloadLink.href = backupUrl;
  downloadLink.download = `workout-backup-${today}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(backupUrl);
  setBackupStatus("Backup exported. Save it somewhere safe, like iCloud Drive.");
}

function restoreBackup(backup) {
  if (!backup || backup.app !== "workout-pwa" || typeof backup.data !== "object") {
    throw new Error("This does not look like a Workout backup file.");
  }

  Object.entries(backup.data).forEach(([key, value]) => {
    if (key.startsWith(APP_STORAGE_PREFIX) && typeof value === "string") {
      window.localStorage.setItem(key, value);
    }
  });

  writeCount(readCount());
}

logSet.addEventListener("click", () => {
  writeCount(readCount() + 1);
});

resetDemo.addEventListener("click", () => {
  writeCount(0);
});

exportBackup.addEventListener("click", downloadBackupFile);

importBackup.addEventListener("change", async (event) => {
  const [file] = event.target.files;

  if (!file) {
    return;
  }

  try {
    const backup = JSON.parse(await file.text());
    restoreBackup(backup);
    setBackupStatus(`Imported ${file.name}. Your local workout data is restored.`);
  } catch (error) {
    setBackupStatus(error.message || "Import failed. Try another backup file.");
  } finally {
    importBackup.value = "";
  }
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

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Toast } from "./components/Toast";
import { loadAppData } from "./data/repository";
import { CalendarScreen } from "./screens/CalendarScreen";
import { DayScreen } from "./screens/DayScreen";
import { GraphsScreen } from "./screens/GraphsScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import type { AppData, Tab } from "./types";

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>("calendar");
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [updateReady, setUpdateReady] = useState(false);

  const refresh = useCallback(() => {
    loadAppData().then(setData).catch((error) => showToast(error.message));
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2800);
  }

  useEffect(() => {
    refresh();
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
    });
  }, [refresh]);

  function reloadForUpdate() {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration?.waiting?.postMessage("SKIP_WAITING");
      window.location.reload();
    });
  }

  if (!data) return <div className="loading">Loading Workout...</div>;

  const title = settingsOpen ? "Settings" : openDate ? "Day" : tab === "calendar" ? "Calendar" : tab === "graphs" ? "Graphs" : "Library";

  return (
    <AppShell
      tab={tab}
      title={title}
      showBack={Boolean(settingsOpen || openDate)}
      onBack={() => { if (settingsOpen) setSettingsOpen(false); else setOpenDate(null); }}
      onTab={(next) => { setOpenDate(null); setSettingsOpen(false); setTab(next); }}
      onSettings={() => setSettingsOpen(true)}
      updateReady={updateReady}
      onReload={reloadForUpdate}
    >
      {settingsOpen ? (
        <SettingsScreen data={data} onRefresh={refresh} toast={showToast} />
      ) : openDate ? (
        <DayScreen date={openDate} data={data} onRefresh={refresh} toast={showToast} />
      ) : tab === "calendar" ? (
        <CalendarScreen data={data} onOpenDay={setOpenDate} />
      ) : tab === "graphs" ? (
        <GraphsScreen data={data} onRefresh={refresh} />
      ) : (
        <LibraryScreen data={data} onRefresh={refresh} toast={showToast} />
      )}
      <Toast message={toastMessage} />
    </AppShell>
  );
}

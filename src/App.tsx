import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { Modal } from "./components/Modal";
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
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "UPDATE_READY") setUpdateReady(true);
      });
    }
  }, [refresh]);

  if (!data) return <div className="loading">Loading Workout...</div>;

  const title = openDate ? "Day" : tab === "calendar" ? "Calendar" : tab === "graphs" ? "Graphs" : "Library";

  return (
    <AppShell tab={tab} title={title} onTab={(next) => { setOpenDate(null); setTab(next); }} onSettings={() => setSettingsOpen(true)} updateReady={updateReady} onReload={() => window.location.reload()}>
      {openDate ? (
        <DayScreen date={openDate} data={data} onBack={() => setOpenDate(null)} onRefresh={refresh} toast={showToast} />
      ) : tab === "calendar" ? (
        <CalendarScreen data={data} onOpenDay={setOpenDate} />
      ) : tab === "graphs" ? (
        <GraphsScreen data={data} onRefresh={refresh} />
      ) : (
        <LibraryScreen data={data} onRefresh={refresh} toast={showToast} />
      )}
      {settingsOpen && (
        <Modal title="Settings" onClose={() => setSettingsOpen(false)}>
          <SettingsScreen data={data} onClose={() => setSettingsOpen(false)} onRefresh={refresh} toast={showToast} />
        </Modal>
      )}
      <Toast message={toastMessage} />
    </AppShell>
  );
}

import { BottomTabs } from "./BottomTabs";
import type { ReactNode } from "react";
import type { Tab } from "../types";

export function AppShell({
  tab,
  title,
  children,
  onTab,
  onSettings,
  updateReady,
  onReload
}: {
  tab: Tab;
  title: string;
  children: ReactNode;
  onTab: (tab: Tab) => void;
  onSettings: () => void;
  updateReady: boolean;
  onReload: () => void;
}) {
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Personal tracker</p>
          <h1>{title}</h1>
        </div>
        <button className="icon-button" onClick={onSettings} aria-label="Open settings" type="button">Gear</button>
      </header>
      {updateReady && (
        <button className="update-banner" onClick={onReload} type="button">Update available. Reload</button>
      )}
      <main className="content">{children}</main>
      <BottomTabs active={tab} onChange={onTab} />
    </div>
  );
}

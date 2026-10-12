import { BottomTabs } from "./BottomTabs";
import { BackIcon, GearIcon } from "./Icons";
import type { ReactNode } from "react";
import type { Tab } from "../types";

export function AppShell({
  tab,
  title,
  children,
  onTab,
  onSettings,
  onBack,
  showBack,
  updateReady,
  onReload
}: {
  tab: Tab;
  title: string;
  children: ReactNode;
  onTab: (tab: Tab) => void;
  onSettings: () => void;
  onBack: () => void;
  showBack: boolean;
  updateReady: boolean;
  onReload: () => void;
}) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-lead">
          {showBack && (
            <button className="icon-button ghost" onClick={onBack} aria-label="Back" type="button">
              <BackIcon />
            </button>
          )}
          <div>
            <p className="eyebrow">Personal tracker</p>
            <h1>{title}</h1>
          </div>
        </div>
        {!showBack && (
          <button className="icon-button ghost" onClick={onSettings} aria-label="Open settings" type="button">
            <GearIcon />
          </button>
        )}
      </header>
      {updateReady && (
        <button className="update-banner" onClick={onReload} type="button">Update available. Reload</button>
      )}
      <main className="content">{children}</main>
      <BottomTabs active={tab} onChange={onTab} />
    </div>
  );
}

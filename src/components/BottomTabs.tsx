import type { Tab } from "../types";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "calendar", label: "Calendar", icon: "Cal" },
  { id: "graphs", label: "Graphs", icon: "Chart" },
  { id: "library", label: "Library", icon: "Lib" }
];

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="bottom-tabs" aria-label="Primary">
      {tabs.map((tab) => (
        <button key={tab.id} className={active === tab.id ? "tab is-active" : "tab"} onClick={() => onChange(tab)} type="button">
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

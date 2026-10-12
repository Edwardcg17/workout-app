import type { Tab } from "../types";
import { CalendarIcon, ChartIcon, LibraryIcon } from "./Icons";

const tabs: { id: Tab; label: string; icon: typeof CalendarIcon }[] = [
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "graphs", label: "Graphs", icon: ChartIcon },
  { id: "library", label: "Library", icon: LibraryIcon }
];

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="bottom-tabs" aria-label="Primary">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.id} className={active === tab.id ? "tab is-active" : "tab"} onClick={() => onChange(tab.id)} type="button">
            <Icon />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

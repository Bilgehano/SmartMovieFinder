import {
  Bookmark,
  CheckCircle2,
  Clock3,
  Star,
  LibraryBig,
} from "lucide-react";
import "./LibraryTabs.css";

const libraryTabs = [
  {
    id: "recent",
    label: "Recently Added",
    icon: Clock3,
  },
  {
    id: "rated",
    label: "Rated Movies",
    icon: Star,
  },
  {
    id: "watch-later",
    label: "Watchlist",
    icon: Bookmark,
  },
  {
    id: "watched",
    label: "Watched Movies",
    icon: CheckCircle2,
  },
  {
    id: "all",
    label: "All Movies",
    icon: LibraryBig,
  },
];

function LibraryTabs({ activeTab, onTabChange }) {
  return (
    <div className="library-tabs">
      {libraryTabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id
                ? "library-tab-button active"
                : "library-tab-button"
            }
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default LibraryTabs;
import "./LibraryTabs.css";

const libraryTabs = [
  { id: "all", label: "All Movies" },
  { id: "watched", label: "Watched Movies" },
  { id: "watch-later", label: "Watchlist" },
  { id: "rated", label: "Rated Movies" },
  { id: "genres", label: "Favorite Genres" },
  { id: "recent", label: "Recently Added" },
];

function LibraryTabs({ activeTab, onTabChange }) {
  return (
    <div className="library-tabs">
      {libraryTabs.map((tab) => (
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
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default LibraryTabs;
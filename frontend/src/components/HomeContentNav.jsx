import "./HomeContentNav.css";

function HomeContentNav() {
  function handleAction(actionName) {
    console.log("Selected:", actionName);
  }

  return (
    <nav className="movie-content-nav" aria-label="Movie content navigation">
      <ul className="movie-content-menu">
        <li className="movie-content-menu-item">
          <button className="movie-content-menu-button">
            Quick Access <span>▾</span>
          </button>

          <div className="movie-content-dropdown">
            <button onClick={() => handleAction("My Library")}>My Library</button>
            <button onClick={() => handleAction("Watchlist")}>Watchlist</button>
            <button onClick={() => handleAction("Recently Viewed")}>
              Recently Viewed
            </button>
          </div>
        </li>

        <li className="movie-content-menu-item">
          <button className="movie-content-menu-button">
            Filter <span>▾</span>
          </button>

          <div className="movie-content-dropdown">
            <button onClick={() => handleAction("Recommended")}>Recommended</button>
            <button onClick={() => handleAction("Popular Movies")}>
              Popular Movies
            </button>
            <button onClick={() => handleAction("Top Rated")}>Top Rated</button>
            <button onClick={() => handleAction("New Releases")}>
              New Releases
            </button>
          </div>
        </li>

        <li className="movie-content-menu-item">
          <button className="movie-content-menu-button">
            Favorite Genres <span>▾</span>
          </button>

          <div className="movie-content-dropdown">
            <button onClick={() => handleAction("Action")}>Action</button>
            <button onClick={() => handleAction("Comedy")}>Comedy</button>
            <button onClick={() => handleAction("Drama")}>Drama</button>
            <button onClick={() => handleAction("Sci-Fi")}>Sci-Fi</button>
            <button onClick={() => handleAction("Thriller")}>Thriller</button>
          </div>
        </li>

        <li className="movie-content-menu-item">
          <button
            className="movie-content-menu-button"
            onClick={() => handleAction("Back to Discover")}
          >
            Back to Discover
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default HomeContentNav;
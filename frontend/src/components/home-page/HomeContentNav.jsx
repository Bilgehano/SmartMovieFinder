import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Grid2X2 } from "lucide-react";

import SearchBar from "../shared/SearchBar";

import "./HomeContentNav.css";

function HomeContentNav({searchValue,onSearchChange,onSearchSubmit,}) {
  const navigate = useNavigate();
  const navigationRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState("");

  useEffect(function () {
    function handleClickOutside(event) {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target)
      ) {
        setActiveDropdown("");
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setActiveDropdown("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  function toggleDropdown(dropdownName) {
    setActiveDropdown(function (currentDropdown) {
      return currentDropdown === dropdownName ? "" : dropdownName;
    });
  }

  function closeDropdown() {
    setActiveDropdown("");
  }

  function goToLibraryTab(tabId) {
    closeDropdown();

    if (tabId === "all") {
      navigate("/library");
      return;
    }

    navigate("/library?tab=" + tabId);
  }

  return (
    <nav
      ref={navigationRef}
      className="movie-content-nav"
      aria-label="Movie content navigation"
    >
      <div className="movie-content-nav-spacer" aria-hidden="true" />

      <div className="movie-content-menu-center">
        <div className="movie-content-search">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder="Search for movies..."
          />
        </div>
      </div>

      <ul className="movie-content-menu movie-content-menu-right">
        <li
          className={
            "movie-content-menu-item " +
            (activeDropdown === "quick-access" ? "active" : "")
          }
        >
          <button
            type="button"
            className="movie-content-menu-button"
            onClick={() => toggleDropdown("quick-access")}
            aria-expanded={activeDropdown === "quick-access"}
            aria-controls="quick-access-dropdown"
          >
            <Grid2X2 size={18} aria-hidden="true" />

            <span className="movie-content-menu-button-label">
              Quick Access
            </span>

            <ChevronDown
              className="movie-content-menu-chevron"
              size={15}
              aria-hidden="true"
            />
          </button>

          <div
            id="quick-access-dropdown"
            className="movie-content-dropdown"
          >
            <button type="button" onClick={() => goToLibraryTab("all")}>
              My Library
            </button>

            <button
              type="button"
              onClick={() => goToLibraryTab("watch-later")}
            >
              Watchlist
            </button>

            <button
              type="button"
              onClick={() => goToLibraryTab("watched")}
            >
              Recently Watched
            </button>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default HomeContentNav;
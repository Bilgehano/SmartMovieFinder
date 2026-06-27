import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Compass,
  Grid2X2,
  Star,
} from "lucide-react";

import SearchBar from "../shared/SearchBar";

import { fetchGenres } from "../../api/movieApi";
import { fetchFavoriteGenres } from "../../api/userApi";
import { getCurrentUserId } from "../../api/userSession";

import "./HomeContentNav.css";

function normalizeGenreName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getFavoriteGenreName(genre) {
  if (typeof genre === "string") {
    return genre;
  }

  return genre?.name ?? genre?.genreName ?? "";
}

function mapFavoriteGenresToOptions(favoriteGenres, availableGenres) {
  return favoriteGenres
    .map(function (favoriteGenre) {
      const favoriteGenreName = getFavoriteGenreName(favoriteGenre);
      const normalizedFavoriteGenreName =
        normalizeGenreName(favoriteGenreName);

      const matchingGenre = availableGenres.find(function (genre) {
        return normalizeGenreName(genre.name) === normalizedFavoriteGenreName;
      });

      if (!matchingGenre) {
        return null;
      }

      return {
        id: matchingGenre.id,
        name: matchingGenre.name,
      };
    })
    .filter(Boolean);
}

function HomeContentNav({
  searchValue,
  onSearchChange,
  onSearchSubmit,
}) {
  const navigate = useNavigate();
  const navigationRef = useRef(null);

  const [activeDropdown, setActiveDropdown] = useState("");
  const [favoriteGenreOptions, setFavoriteGenreOptions] = useState([]);
  const [favoriteGenresLoading, setFavoriteGenresLoading] = useState(false);

  useEffect(function () {
    let isMounted = true;

    async function loadFavoriteGenres() {
      const currentUserId = getCurrentUserId();

      if (!currentUserId) {
        setFavoriteGenreOptions([]);
        return;
      }

      setFavoriteGenresLoading(true);

      try {
        const [favoriteGenres, availableGenres] = await Promise.all([
          fetchFavoriteGenres(currentUserId),
          fetchGenres(),
        ]);

        if (!isMounted) {
          return;
        }

        setFavoriteGenreOptions(
          mapFavoriteGenresToOptions(favoriteGenres, availableGenres)
        );
      } catch (error) {
        console.warn("Favorite genres could not be loaded:", error);

        if (isMounted) {
          setFavoriteGenreOptions([]);
        }
      } finally {
        if (isMounted) {
          setFavoriteGenresLoading(false);
        }
      }
    }

    loadFavoriteGenres();

    return function cleanup() {
      isMounted = false;
    };
  }, []);

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

  function goToSearchSort(sortValue) {
    closeDropdown();
    navigate("/search?sortBy=" + sortValue);
  }

  function goToGenreSearch(genreId) {
    closeDropdown();
    navigate("/search?genre=" + genreId);
  }

  return (
    <nav
      ref={navigationRef}
      className="movie-content-nav"
      aria-label="Movie content navigation"
    >
      <ul className="movie-content-menu movie-content-menu-left">
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

      <div className="movie-content-menu-center">
        <div className="movie-content-search">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            placeholder="Search for movies..."
          />
        </div>

        <ul className="movie-content-menu movie-content-menu-explore">
          <li
            className={
              "movie-content-menu-item " +
              (activeDropdown === "explore" ? "active" : "")
            }
          >
            <button
              type="button"
              className="movie-content-menu-button"
              onClick={() => toggleDropdown("explore")}
              aria-expanded={activeDropdown === "explore"}
              aria-controls="explore-dropdown"
            >
              <Compass size={18} aria-hidden="true" />

              <span className="movie-content-menu-button-label">
                Explore
              </span>

              <ChevronDown
                className="movie-content-menu-chevron"
                size={15}
                aria-hidden="true"
              />
            </button>

            <div
              id="explore-dropdown"
              className="movie-content-dropdown"
            >
              <button
                type="button"
                onClick={() => goToSearchSort("recommended")}
              >
                Recommended
              </button>

              <button
                type="button"
                onClick={() => goToSearchSort("popular")}
              >
                Popular Movies
              </button>

              <button
                type="button"
                onClick={() => goToSearchSort("top-rated")}
              >
                Top Rated
              </button>

              <button
                type="button"
                onClick={() => goToSearchSort("new-releases")}
              >
                New Releases
              </button>
            </div>
          </li>
        </ul>
      </div>

      <ul className="movie-content-menu movie-content-menu-right">
        <li
          className={
            "movie-content-menu-item " +
            (activeDropdown === "favorite-genres" ? "active" : "")
          }
        >
          <button
            type="button"
            className="movie-content-menu-button"
            onClick={() => toggleDropdown("favorite-genres")}
            aria-expanded={activeDropdown === "favorite-genres"}
            aria-controls="favorite-genres-dropdown"
          >
            <Star size={18} aria-hidden="true" />

            <span className="movie-content-menu-button-label">
              Favorite Genres
            </span>

            <ChevronDown
              className="movie-content-menu-chevron"
              size={15}
              aria-hidden="true"
            />
          </button>

          <div
            id="favorite-genres-dropdown"
            className="movie-content-dropdown"
          >
            {favoriteGenresLoading ? (
              <button type="button" disabled>
                Loading genres...
              </button>
            ) : favoriteGenreOptions.length === 0 ? (
              <button type="button" disabled>
                No favorite genres yet
              </button>
            ) : (
              favoriteGenreOptions.map(function (genre) {
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => goToGenreSearch(genre.id)}
                  >
                    {genre.name}
                  </button>
                );
              })
            )}
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default HomeContentNav;
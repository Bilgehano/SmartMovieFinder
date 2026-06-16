import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchGenres } from "../api/movieApi";
import { fetchFavoriteGenres } from "../api/userApi";
import { getCurrentUserId } from "../api/userSession";

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

function HomeContentNav() {
  const navigate = useNavigate();

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

  function goToLibraryTab(tabId) {
    if (tabId === "all") {
      navigate("/library");
      return;
    }

    navigate("/library?tab=" + tabId);
  }

  function goToSearchSort(sortValue) {
    navigate("/search?sortBy=" + sortValue);
  }

  function goToGenreSearch(genreId) {
    navigate("/search?genre=" + genreId);
  }

  function goToDiscover() {
    navigate("/search");
  }

  return (
    <nav className="movie-content-nav" aria-label="Movie content navigation">
      <ul className="movie-content-menu">
        <li className="movie-content-menu-item">
          <button className="movie-content-menu-button">
            Quick Access <span>▾</span>
          </button>

          <div className="movie-content-dropdown">
            <button onClick={() => goToLibraryTab("all")}>
              My Library
            </button>

            <button onClick={() => goToLibraryTab("watch-later")}>
              Watchlist
            </button>

            <button onClick={() => goToLibraryTab("watched")}>
              Recently Watched
            </button>
          </div>
        </li>

        <li className="movie-content-menu-item">
          <button className="movie-content-menu-button">
            Filter <span>▾</span>
          </button>

          <div className="movie-content-dropdown">
            <button onClick={() => goToSearchSort("recommended")}>
              Recommended
            </button>

            <button onClick={() => goToSearchSort("popular")}>
              Popular Movies
            </button>

            <button onClick={() => goToSearchSort("top-rated")}>
              Top Rated
            </button>

            <button onClick={() => goToSearchSort("new-releases")}>
              New Releases
            </button>
          </div>
        </li>

        <li className="movie-content-menu-item">
          <button className="movie-content-menu-button">
            Favorite Genres <span>▾</span>
          </button>

          <div className="movie-content-dropdown">
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

        <li className="movie-content-menu-item">
          <button
            className="movie-content-menu-button"
            onClick={goToDiscover}
          >
            Back to Discover
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default HomeContentNav;
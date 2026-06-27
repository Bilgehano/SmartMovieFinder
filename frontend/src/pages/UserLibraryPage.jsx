import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/shared/SearchBar";
import BrowseMovieGrid from "../components/search-page/BrowseMovieGrid";
import BrowsePagination from "../components/search-page/BrowsePagination";
import LibraryTabs from "../components/library-page/LibraryTabs";
import LibraryOverview from "../components/library-page/LibraryOverview";
import FavoriteGenresPanel from "../components/library-page/FavoriteGenresPanel";

import { fetchGenres } from "../api/movieApi";
import {
  fetchFavoriteGenres,
  fetchUserRatings,
  fetchWatchedMovies,
  fetchWatchLaterMovies,
} from "../api/userApi";
import { getCurrentUserId } from "../api/userSession";

import { createGenreMap } from "../utils/movieMapper";
import { mapUserLibraryData } from "../utils/libraryMapper";

import "./UserLibraryPage.css";

const MOVIES_PER_PAGE = 8;

const VALID_LIBRARY_TABS = [
  "all",
  "watched",
  "watch-later",
  "rated",
  "genres",
  "recent",
];

function getValidLibraryTab(tabId) {
  if (VALID_LIBRARY_TABS.includes(tabId)) {
    return tabId;
  }

  return "all";
}

function movieMatchesSearch(movie, searchTerm) {
  const normalizedSearchTerm = searchTerm
    .trim()
    .toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  const title = String(movie.title ?? "").toLowerCase();
  const genre = String(movie.genre ?? "").toLowerCase();

  return (
    title.includes(normalizedSearchTerm) ||
    genre.includes(normalizedSearchTerm)
  );
}

function getMoviesByTab(movies, activeTab) {
  switch (activeTab) {
    case "watched":
      return movies.filter((movie) =>
        movie.status.includes("watched")
      );

    case "watch-later":
      return movies.filter((movie) =>
        movie.status.includes("watch-later")
      );

    case "rated":
      return movies.filter((movie) =>
        movie.status.includes("rated")
      );

    case "recent":
      return [...movies].sort(
        (firstMovie, secondMovie) =>
          new Date(secondMovie.addedAt || 0) -
          new Date(firstMovie.addedAt || 0)
      );

    case "all":
    default:
      return movies;
  }
}

function getSettledValue(result, fallbackValue) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  return fallbackValue;
}

function UserLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(
    getValidLibraryTab(searchParams.get("tab"))
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [libraryMovies, setLibraryMovies] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const tabFromUrl = getValidLibraryTab(searchParams.get("tab"));

    setActiveTab(tabFromUrl);
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadUserLibrary() {
      const userId = getCurrentUserId();

      if (!userId) {
        setLibraryMovies([]);
        setFavoriteGenres([]);
        setErrorMessage(
          "Please log in to view your personal library."
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      const [
        genresResult,
        watchedResult,
        watchLaterResult,
        ratingsResult,
        favoriteGenresResult,
      ] = await Promise.allSettled([
        fetchGenres(),
        fetchWatchedMovies(userId),
        fetchWatchLaterMovies(userId),
        fetchUserRatings(userId),
        fetchFavoriteGenres(userId),
      ]);

      if (!isMounted) {
        return;
      }

      const genres = getSettledValue(genresResult, []);

      const watchedMovies = getSettledValue(
        watchedResult,
        []
      );

      const watchLaterMovies = getSettledValue(
        watchLaterResult,
        []
      );

      const ratings = getSettledValue(
        ratingsResult,
        []
      );

      const loadedFavoriteGenres = getSettledValue(
        favoriteGenresResult,
        []
      );

      const genreMap = createGenreMap(genres);

      const mappedLibraryMovies = mapUserLibraryData({
        watchedMovies,
        watchLaterMovies,
        ratings,
        genreMap,
      });

      setLibraryMovies(mappedLibraryMovies);
      setFavoriteGenres(loadedFavoriteGenres);

      const hasFailedRequest = [
        genresResult,
        watchedResult,
        watchLaterResult,
        ratingsResult,
        favoriteGenresResult,
      ].some((result) => result.status === "rejected");

      if (hasFailedRequest) {
        setErrorMessage(
          "Some library data could not be loaded from the backend."
        );
      }

      setIsLoading(false);
    }

    loadUserLibrary();

    return () => {
      isMounted = false;
    };
  }, []);

  const watchedMoviesCount = useMemo(
    () =>
      libraryMovies.filter((movie) =>
        movie.status.includes("watched")
      ).length,
    [libraryMovies]
  );

  const watchlistMoviesCount = useMemo(
    () =>
      libraryMovies.filter((movie) =>
        movie.status.includes("watch-later")
      ).length,
    [libraryMovies]
  );

  const ratedMoviesCount = useMemo(
    () =>
      libraryMovies.filter((movie) =>
        movie.status.includes("rated")
      ).length,
    [libraryMovies]
  );

  const filteredMovies = useMemo(() => {
    const tabMovies = getMoviesByTab(
      libraryMovies,
      activeTab
    );

    return tabMovies.filter((movie) =>
      movieMatchesSearch(movie, searchTerm)
    );
  }, [libraryMovies, activeTab, searchTerm]);

  const visibleMovies = useMemo(() => {
    return filteredMovies.slice(
      (currentPage - 1) * MOVIES_PER_PAGE,
      currentPage * MOVIES_PER_PAGE
    );
  }, [filteredMovies, currentPage]);

  const hasNextPage =
    currentPage * MOVIES_PER_PAGE <
    filteredMovies.length;

  function handleSearchChange(value) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  function handleSearchSubmit(value) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  function handleTabChange(tabId) {
    const validTabId = getValidLibraryTab(tabId);

    setActiveTab(validTabId);
    setCurrentPage(1);

    if (validTabId === "all") {
      setSearchParams({});
      return;
    }

    setSearchParams({ tab: validTabId });
  }

  return (
    <main className="user-library-page">
      <section className="user-library-top">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          placeholder="Search in your library..."
        />
      </section>

      <section className="user-library-shell">
        <LibraryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <section className="library-intro">
          <div>
            <h2>My Library</h2>

            <p>
              Manage your watched movies, watchlist,
              rated movies, favorite genres and recently
              added titles in one place.
            </p>
          </div>

          <LibraryOverview
            totalMovies={libraryMovies.length}
            watchedMovies={watchedMoviesCount}
            watchlistMovies={watchlistMoviesCount}
            ratedMovies={ratedMoviesCount}
          />
        </section>

        {errorMessage && (
          <div className="library-state-message library-state-error">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="library-state-message">
            Loading your library...
          </div>
        ) : activeTab === "genres" ? (
          <FavoriteGenresPanel
            genres={favoriteGenres}
          />
        ) : filteredMovies.length === 0 ? (
          <div className="library-state-message">
            No movies found in this library section.
          </div>
        ) : (
          <>
            <BrowseMovieGrid movies={visibleMovies} />

            <BrowsePagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </main>
  );
}

export default UserLibraryPage;
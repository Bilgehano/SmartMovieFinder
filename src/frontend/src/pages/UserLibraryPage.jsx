import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/shared/SearchBar";
import BrowseMovieGrid from "../components/search-page/BrowseMovieGrid";
import BrowsePagination from "../components/search-page/BrowsePagination";
import LibraryTabs from "../components/library-page/LibraryTabs";
import LibraryOverview from "../components/library-page/LibraryOverview";

import {
  fetchGenres,
  fetchMovieDetail,
} from "../api/movieApi";
import {
  fetchUserRatings,
  fetchWatchedMovies,
  fetchWatchLaterMovies,
} from "../api/userApi";
import { getCurrentUserId } from "../api/userSession";

import { createGenreMap } from "../utils/movieMapper";
import {
  enrichLibraryMoviesWithTmdbDetails,
  mapUserLibraryData,
} from "../utils/libraryMapper";

import "./UserLibraryPage.css";

const MOVIES_PER_PAGE = 8;

const VALID_LIBRARY_TABS = [
  "all",
  "watched",
  "watch-later",
  "rated",
  "recent",
];

function getValidLibraryTab(tabId) {
  if (VALID_LIBRARY_TABS.includes(tabId)) {
    return tabId;
  }

  return "all";
}

function movieMatchesSearch(movie, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

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

function getEmptyStateContent(activeTab, hasSearchTerm) {
  if (hasSearchTerm) {
    return {
      title: "No matching Movies found",
      text: "Try another Title or Search term in your Library.",
    };
  }

  switch (activeTab) {
    case "watched":
      return {
        title: "No Watched Movies yet",
        text: "Movies you mark as Watched will appear here.",
      };

    case "watch-later":
      return {
        title: "Your Watchlist is empty",
        text: "Add movies to Watch Later to keep them here.",
      };

    case "rated":
      return {
        title: "No Rated Movies yet",
        text: "Rate a Movie to see it in this section.",
      };

    case "recent":
      return {
        title: "No recently added Movies yet",
        text: "Movies added to your Library will appear here.",
      };

    case "all":
    default:
      return {
        title: "Your Library is empty",
        text: "Add Movies to your Watchlist, mark them as Watched or rate them.",
      };
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
  const [hasNoLoggedInUser, setHasNoLoggedInUser] = useState(false);

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
        if (!isMounted) {
          return;
        }

        setLibraryMovies([]);
        setHasNoLoggedInUser(true);
        setErrorMessage("");
        setIsLoading(false);
        return;
      }

      setHasNoLoggedInUser(false);
      setIsLoading(true);
      setErrorMessage("");

      const [
        genresResult,
        watchedResult,
        watchLaterResult,
        ratingsResult,
      ] = await Promise.allSettled([
        fetchGenres(),
        fetchWatchedMovies(userId),
        fetchWatchLaterMovies(userId),
        fetchUserRatings(userId),
      ]);

      if (!isMounted) {
        return;
      }

      const genres = getSettledValue(genresResult, []);
      const watchedMovies = getSettledValue(watchedResult, []);
      const watchLaterMovies = getSettledValue(
        watchLaterResult,
        []
      );
      const ratings = getSettledValue(ratingsResult, []);

      const genreMap = createGenreMap(genres);

      const mappedLibraryMovies = mapUserLibraryData({
        watchedMovies,
        watchLaterMovies,
        ratings,
        genreMap,
      });

      const tmdbDetailResults = await Promise.allSettled(
        mappedLibraryMovies.map((movie) =>
          fetchMovieDetail(movie.tmdbId)
        )
      );

      if (!isMounted) {
        return;
      }

      const tmdbDetailsById = {};

      tmdbDetailResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const movie = mappedLibraryMovies[index];

          tmdbDetailsById[String(movie.tmdbId)] = result.value;
        }
      });

      const enrichedLibraryMovies =
        enrichLibraryMoviesWithTmdbDetails(
          mappedLibraryMovies,
          tmdbDetailsById,
          genreMap
        );

      setLibraryMovies(enrichedLibraryMovies);

      const hasFailedRequest = [
        genresResult,
        watchedResult,
        watchLaterResult,
        ratingsResult,
        ...tmdbDetailResults,
      ].some((result) => result.status === "rejected");

      if (hasFailedRequest) {
        setErrorMessage(
          "Some Library details could not be loaded. Available information is still shown."
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

  const emptyStateContent = getEmptyStateContent(
    activeTab,
    Boolean(searchTerm.trim())
  );

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
      <section className="user-library-header">
        <div className="user-library-header-content">
          <div className="user-library-header-top">
            <div className="user-library-intro">
              <h1>My Library</h1>

              <p>
                Manage your Watched Movies, Watchlist and Ratings
                in one place.
              </p>
            </div>

            <LibraryOverview
              totalMovies={libraryMovies.length}
              watchedMovies={watchedMoviesCount}
              watchlistMovies={watchlistMoviesCount}
              ratedMovies={ratedMoviesCount}
            />
          </div>

          <div className="user-library-header-search">
            <SearchBar
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              placeholder="Search in your library..."
            />
          </div>

          <div className="user-library-header-divider" />

          <LibraryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </section>

      <section className="user-library-shell">
        {hasNoLoggedInUser ? (
          <div className="library-state-message">
            <div>
              <h2>Log in to view your Library</h2>
              <p>
                Your Watched Movies, Watchlist and Ratings will
                appear here after you sign in.
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="library-state-message library-state-error">
            <div>
              <h2>Some Library details could not be loaded</h2>
              <p>{errorMessage}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="library-state-message">
            <div>
              <h2>Loading your Library</h2>
              <p>Please wait while your Movies are being loaded.</p>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="library-state-message">
            <div>
              <h2>{emptyStateContent.title}</h2>
              <p>{emptyStateContent.text}</p>
            </div>
          </div>
        ) : (
          <>
            <BrowseMovieGrid
              movies={visibleMovies}
              showUserRating={activeTab === "rated"}
            />

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
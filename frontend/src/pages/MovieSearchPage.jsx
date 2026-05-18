import { useEffect, useMemo, useState } from "react";
import {
  fetchGenres,
  fetchMoviesByGenre,
  fetchPopularMovies,
  searchMovies,
} from "../api/movieApi";
import {
  createGenreMap,
  mapTmdbMovieResponse,
} from "../utils/movieMapper";
import BrowseFilterBar from "../components/browse/BrowseFilterBar";
import BrowseMovieGrid from "../components/browse/BrowseMovieGrid";
import BrowsePagination from "../components/browse/BrowsePagination";
import SearchBar from "../components/SearchBar";
import "./MovieSearchPage.css";

const MOVIES_PER_PAGE = 20;

// NEW: Wenn Year / Rating / Sort aktiv ist, laden wir mehrere Backend-Seiten.
// 10 Seiten = ungefähr bis zu 200 Filme als Grundlage für Frontend-Filter.
const BACKEND_PAGES_TO_PREFETCH = 10;

function getMovieRating(movie) {
  return Number(movie.rating || 0);
}

function getMovieYear(movie) {
  return Number(movie.year || 0);
}

// NEW: Prüft, ob Filter aktiv sind, die das Backend aktuell nicht direkt unterstützt.
function hasExtraFrontendFilters(filters) {
  return (
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.rating !== "all" ||
    filters.sortBy !== "relevance"
  );
}

function movieMatchesLocalFilters(movie, filters, genreMap) {
  const movieYear = getMovieYear(movie);
  const movieRating = getMovieRating(movie);

  const selectedGenreName =
    filters.genre === "all" ? "" : genreMap[String(filters.genre)];

  const matchesGenre =
    filters.genre === "all" ||
    String(movie.genre || "").includes(selectedGenreName);

  const matchesYearFrom =
    filters.yearFrom === "" || movieYear >= Number(filters.yearFrom);

  const matchesYearTo =
    filters.yearTo === "" || movieYear <= Number(filters.yearTo);

  const matchesRating =
    filters.rating === "all" || movieRating >= Number(filters.rating);

  return matchesGenre && matchesYearFrom && matchesYearTo && matchesRating;
}

function sortMovies(movies, sortBy) {
  const sortedMovies = [...movies];

  switch (sortBy) {
    case "rating-desc":
      return sortedMovies.sort((a, b) => getMovieRating(b) - getMovieRating(a));

    case "year-desc":
      return sortedMovies.sort((a, b) => getMovieYear(b) - getMovieYear(a));

    case "year-asc":
      return sortedMovies.sort((a, b) => getMovieYear(a) - getMovieYear(b));

    case "title-asc":
      return sortedMovies.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );

    case "relevance":
    default:
      return sortedMovies;
  }
}

// NEW: Entscheidet, welcher Backend-Endpoint genutzt wird.
async function loadMoviePage({ searchTerm, genreId, page }) {
  if (searchTerm) {
    return searchMovies(searchTerm, page);
  }

  if (genreId !== "all") {
    return fetchMoviesByGenre(genreId, page);
  }

  return fetchPopularMovies(page);
}

function removeDuplicateMovies(movies) {
  const uniqueMovies = new Map();

  movies.forEach((movie) => {
    if (!movie.id) {
      return;
    }

    if (!uniqueMovies.has(movie.id)) {
      uniqueMovies.set(movie.id, movie);
    }
  });

  return Array.from(uniqueMovies.values());
}

async function loadMoviePages({
  searchTerm,
  genreId,
  genreMap,
  shouldPrefetch,
  currentPage,
}) {
  const pagesToLoad = shouldPrefetch
    ? BACKEND_PAGES_TO_PREFETCH
    : currentPage;

  const requests = [];

  for (let page = 1; page <= pagesToLoad; page += 1) {
    requests.push(
      loadMoviePage({
        searchTerm,
        genreId,
        page,
      })
    );
  }

  const responses = await Promise.all(requests);

  const mappedResponses = responses.map((response) =>
    mapTmdbMovieResponse(response, genreMap)
  );

  const allMovies = removeDuplicateMovies(
    mappedResponses.flatMap((response) => response.movies)
  );
  const lastResponse = mappedResponses[mappedResponses.length - 1];

  return {
    movies: allMovies,
    hasNextBackendPage: Boolean(lastResponse?.hasNextPage),
  };
}

export default function MovieSearchPage() {
  const [searchInput, setSearchInput] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  const [draftFilters, setDraftFilters] = useState({
    genre: "all",
    yearFrom: "",
    yearTo: "",
    rating: "all",
    sortBy: "relevance",
  });

  const [activeFilters, setActiveFilters] = useState(draftFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const [availableGenres, setAvailableGenres] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [movies, setMovies] = useState([]);
  const [hasNextBackendPage, setHasNextBackendPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadGenres() {
      try {
        const genres = await fetchGenres();

        setAvailableGenres(genres);
        setGenreMap(createGenreMap(genres));
      } catch (error) {
        console.error("Failed to load genres:", error);
        setErrorMessage("Could not load genres from the backend.");
      }
    }

    loadGenres();
  }, []);

  useEffect(() => {
    async function loadMovies() {
      if (Object.keys(genreMap).length === 0) {
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const trimmedSearchTerm = submittedSearchTerm.trim();

        // NEW: Wenn Year/Rating/Sort aktiv ist, laden wir mehrere Seiten vor.
        const shouldPrefetch = hasExtraFrontendFilters(activeFilters);

        const loadedData = await loadMoviePages({
          searchTerm: trimmedSearchTerm,
          genreId: activeFilters.genre,
          genreMap,
          shouldPrefetch,
          currentPage,
        });

        setMovies(loadedData.movies);
        setHasNextBackendPage(loadedData.hasNextBackendPage);
      } catch (error) {
        console.error("Failed to load movies:", error);
        setMovies([]);
        setHasNextBackendPage(false);
        setErrorMessage("Could not load movies from the backend.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMovies();
  }, [
    submittedSearchTerm,
    activeFilters.genre,
    activeFilters.yearFrom,
    activeFilters.yearTo,
    activeFilters.rating,
    activeFilters.sortBy,
    currentPage,
    genreMap,
  ]);

  const filteredAndSortedMovies = useMemo(() => {
    const filteredMovies = movies.filter((movie) =>
      movieMatchesLocalFilters(movie, activeFilters, genreMap)
    );

    return sortMovies(filteredMovies, activeFilters.sortBy);
  }, [movies, activeFilters, genreMap]);

  const visibleMovies = useMemo(() => {
    return filteredAndSortedMovies.slice(
      (currentPage - 1) * MOVIES_PER_PAGE,
      currentPage * MOVIES_PER_PAGE
    );
  }, [filteredAndSortedMovies, currentPage]);

  const isUsingPrefetch = hasExtraFrontendFilters(activeFilters);

  const hasNextLocalPage =
    currentPage * MOVIES_PER_PAGE < filteredAndSortedMovies.length;

  // CHANGED:
  // Wenn Prefetch aktiv ist, zeigen wir nur Next, wenn lokal noch genug gefilterte Filme da sind.
  // Sonst könnte man auf eine leere Seite klicken.
  const hasNextPage = isUsingPrefetch
    ? hasNextLocalPage
    : hasNextLocalPage || hasNextBackendPage;

  function handleSearchChange(value) {
    setSearchInput(value);
  }

  function handleSearchSubmit(value) {
    setSubmittedSearchTerm(value);
    setCurrentPage(1);
  }

  function handleFilterChange(filterName, value) {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }));
  }

  function handleApplyFilters() {
    setActiveFilters(draftFilters);
    setCurrentPage(1);
  }

  function handleClearFilters() {
    const clearedFilters = {
      genre: "all",
      yearFrom: "",
      yearTo: "",
      rating: "all",
      sortBy: "relevance",
    };

    setDraftFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setSearchInput("");
    setSubmittedSearchTerm("");
    setCurrentPage(1);
  }

  return (
    <main className="movie-search-page">
      <section className="movie-search-top">
        <SearchBar
          value={searchInput}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          placeholder="Search for movies..."
        />
      </section>

      <section className="movie-search-content-shell">
        <BrowseFilterBar
          filters={draftFilters}
          availableGenres={availableGenres}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        <div className="movie-search-intro">
          <h2>Search Movies</h2>
          <p>
            Explore movies with search, genre, year, rating and sorting options
            to quickly find titles that match your interests.
          </p>
        </div>

        {errorMessage && (
          <div className="movie-search-message movie-search-message-error">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="movie-search-message">Loading movies...</div>
        ) : (
          <BrowseMovieGrid movies={visibleMovies} />
        )}

        <BrowsePagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}
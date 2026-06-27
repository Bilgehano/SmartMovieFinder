import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { fetchGenres } from "../api/movieApi";
import { createGenreMap } from "../utils/movieMapper";

import BrowseFilterBar from "../components/search-page/BrowseFilterBar";
import BrowseMovieGrid from "../components/search-page/BrowseMovieGrid";
import BrowsePagination from "../components/search-page/BrowsePagination";
import SearchBar from "../components/shared/SearchBar";

import {
  DEFAULT_FILTERS,
  DEFAULT_SOURCE,
  MOVIES_PER_PAGE,
} from "../features/movie-search/movieSearchConstants";
import {
  buildSearchParams,
  getFiltersFromSearchParams,
  getSourceFromSortBy,
  getValidSearchSource,
  hasExtraFrontendFilters,
  movieMatchesLocalFilters,
  sortMovies,
} from "../features/movie-search/movieSearchHelpers";
import { loadMoviePages } from "../features/movie-search/movieSearchApi";
import { validateYearFilters } from "../features/movie-search/movieSearchValidation";

import "./MovieSearchPage.css";

export default function MovieSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchText = searchParams.toString();

  const [searchInput, setSearchInput] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");

  const [activeSource, setActiveSource] = useState(DEFAULT_SOURCE);

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);

  const [currentPage, setCurrentPage] = useState(1);

  const [availableGenres, setAvailableGenres] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [movies, setMovies] = useState([]);
  const [hasNextBackendPage, setHasNextBackendPage] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [yearValidationMessage, setYearValidationMessage] = useState("");

  useEffect(() => {
    const filtersFromUrl = getFiltersFromSearchParams(searchParams);

    const sourceFromUrl = getValidSearchSource(
      searchParams.get("source")
    );

    const sourceFromSortBy = getSourceFromSortBy(
      filtersFromUrl.sortBy
    );

    const searchTermFromUrl = searchParams.get("query") || "";

    setActiveSource(
      searchParams.get("source")
        ? sourceFromUrl
        : sourceFromSortBy
    );

    setDraftFilters(filtersFromUrl);
    setActiveFilters(filtersFromUrl);
    setSearchInput(searchTermFromUrl);
    setSubmittedSearchTerm(searchTermFromUrl);
    setCurrentPage(1);
    setYearValidationMessage("");
  }, [urlSearchText]);

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

        const shouldPrefetch =
          hasExtraFrontendFilters(activeFilters) ||
          activeSource === "new-releases";

        const loadedData = await loadMoviePages({
          searchTerm: trimmedSearchTerm,
          genreId: activeFilters.genre,
          sourceType: activeSource,
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
    activeSource,
    activeFilters.genre,
    activeFilters.yearFrom,
    activeFilters.yearTo,
    activeFilters.rating,
    activeFilters.sortBy,
    currentPage,
    genreMap,
  ]);

  const isUsingPrefetch =
    hasExtraFrontendFilters(activeFilters) ||
    activeSource === "new-releases" ||
    activeSource === "recommended";

  const filteredAndSortedMovies = useMemo(() => {
    const filteredMovies = movies.filter((movie) =>
      movieMatchesLocalFilters(movie, activeFilters, genreMap)
    );

    return sortMovies(filteredMovies, activeFilters.sortBy);
  }, [movies, activeFilters, genreMap]);

  const visibleMovies = useMemo(() => {
    if (!isUsingPrefetch) {
      return movies;
    }

    return filteredAndSortedMovies.slice(
      (currentPage - 1) * MOVIES_PER_PAGE,
      currentPage * MOVIES_PER_PAGE
    );
  }, [
    movies,
    filteredAndSortedMovies,
    currentPage,
    isUsingPrefetch,
  ]);

  const hasNextLocalPage =
    currentPage * MOVIES_PER_PAGE < filteredAndSortedMovies.length;

  const hasNextPage = isUsingPrefetch
    ? hasNextLocalPage
    : hasNextBackendPage;

  function handleSearchChange(value) {
    setSearchInput(value);
  }

  function handleSearchSubmit(value) {
    setSubmittedSearchTerm(value);
    setCurrentPage(1);

    setSearchParams(
      buildSearchParams(activeSource, value, activeFilters)
    );
  }

  function handleFilterChange(filterName, value) {
    if (
      filterName === "yearFrom" ||
      filterName === "yearTo"
    ) {
      setYearValidationMessage("");
    }

    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }));
  }

  function handleApplyFilters() {
    const validationMessage = validateYearFilters(draftFilters);

    if (validationMessage) {
      setYearValidationMessage(validationMessage);
      return;
    }

    setYearValidationMessage("");

    const nextSource = getSourceFromSortBy(draftFilters.sortBy);

    setActiveSource(nextSource);
    setActiveFilters(draftFilters);
    setCurrentPage(1);

    setSearchParams(
      buildSearchParams(
        nextSource,
        submittedSearchTerm,
        draftFilters
      )
    );
  }

  function handleClearFilters() {
    setYearValidationMessage("");
    setActiveSource(DEFAULT_SOURCE);
    setDraftFilters(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setSubmittedSearchTerm("");
    setCurrentPage(1);
    setSearchParams({});
  }

  return (
    <main className="movie-search-page">
      <section className="movie-search-header">
        <div className="movie-search-header-content">
          <div className="movie-search-header-intro">
            <h1>Search Movies</h1>

            <p>
              Search for movies by title or refine your results with genres,
              years, ratings and sorting.
            </p>
          </div>

          <div className="movie-search-header-search">
            <SearchBar
              value={searchInput}
              onChange={handleSearchChange}
              onSubmit={handleSearchSubmit}
              placeholder="Search for movies..."
            />
          </div>

          <div className="movie-search-header-divider" />

          <BrowseFilterBar
            filters={draftFilters}
            availableGenres={availableGenres}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            yearValidationMessage={yearValidationMessage}
          />
        </div>
      </section>

      <section className="movie-search-content-shell">
        {errorMessage && (
          <div className="movie-search-message movie-search-message-error">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="movie-search-message">
            Loading movies...
          </div>
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
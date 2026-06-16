import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  fetchGenres,
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchTopRatedMovies,
  searchMovies,
} from "../api/movieApi";
import { fetchRecommendedMovies } from "../api/recommendationApi";
import { getCurrentUserId } from "../api/userSession";
import { createGenreMap } from "../utils/movieMapper";

import BrowseFilterBar from "../components/browse/BrowseFilterBar";
import BrowseMovieGrid from "../components/browse/BrowseMovieGrid";
import BrowsePagination from "../components/browse/BrowsePagination";
import SearchBar from "../components/SearchBar";
import "./MovieSearchPage.css";

const MOVIES_PER_PAGE = 20;
const BACKEND_PAGES_TO_PREFETCH = 10;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const DEFAULT_SOURCE = "popular";

const DEFAULT_FILTERS = {
  genre: "all",
  yearFrom: "",
  yearTo: "",
  rating: "all",
  sortBy: "relevance",
};

const SOURCE_SORT_VALUES = [
  "popular",
  "top-rated",
  "new-releases",
  "recommended",
];

function getSourceFromSortBy(sortBy) {
  if (SOURCE_SORT_VALUES.includes(sortBy)) {
    return sortBy;
  }

  return DEFAULT_SOURCE;
}

const VALID_SEARCH_SOURCES = [
  "popular",
  "top-rated",
  "new-releases",
  "recommended",
];

function getValidSearchSource(sourceValue) {
  if (VALID_SEARCH_SOURCES.includes(sourceValue)) {
    return sourceValue;
  }

  return DEFAULT_SOURCE;
}

function getFiltersFromSearchParams(searchParams) {
  return {
    genre: searchParams.get("genre") || DEFAULT_FILTERS.genre,
    yearFrom: searchParams.get("yearFrom") || DEFAULT_FILTERS.yearFrom,
    yearTo: searchParams.get("yearTo") || DEFAULT_FILTERS.yearTo,
    rating: searchParams.get("rating") || DEFAULT_FILTERS.rating,
    sortBy: searchParams.get("sortBy") || DEFAULT_FILTERS.sortBy,
  };
}

function buildSearchParams(sourceType, searchTerm, filters) {
  const params = {};

  if (sourceType !== DEFAULT_SOURCE) {
    params.source = sourceType;
  }

  if (searchTerm.trim()) {
    params.query = searchTerm.trim();
  }

  if (filters.genre !== DEFAULT_FILTERS.genre) {
    params.genre = filters.genre;
  }

  if (filters.yearFrom !== DEFAULT_FILTERS.yearFrom) {
    params.yearFrom = filters.yearFrom;
  }

  if (filters.yearTo !== DEFAULT_FILTERS.yearTo) {
    params.yearTo = filters.yearTo;
  }

  if (filters.rating !== DEFAULT_FILTERS.rating) {
    params.rating = filters.rating;
  }

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.sortBy = filters.sortBy;
  }

  return params;
}

function getMovieRating(movie) {
  return Number(movie.rating || 0);
}

function getMovieYear(movie) {
  return Number(movie.year || 0);
}

function hasExtraFrontendFilters(filters) {
  return (
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.rating !== "all" ||
    filters.sortBy !== "relevance"
  );
}

function getPosterUrl(posterPath) {
  if (!posterPath) {
    return "";
  }

  if (
    posterPath.startsWith("http://") ||
    posterPath.startsWith("https://")
  ) {
    return posterPath;
  }

  return TMDB_IMAGE_BASE_URL + posterPath;
}

function getYear(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  return String(dateValue).slice(0, 4);
}

function getGenreLabel(movie, genreMap) {
  if (movie.genre) {
    return movie.genre;
  }

  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres
      .map(function (genre) {
        return genre.name;
      })
      .filter(Boolean)
      .join(", ");
  }

  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    const genreNames = movie.genre_ids
      .map(function (genreId) {
        return genreMap[String(genreId)];
      })
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  if (Array.isArray(movie.genreIds) && movie.genreIds.length > 0) {
    const genreNames = movie.genreIds
      .map(function (genreId) {
        return genreMap[String(genreId)];
      })
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  if (typeof movie.genreIds === "string" && movie.genreIds.trim()) {
    const genreNames = movie.genreIds
      .split(",")
      .map(function (genreId) {
        return genreId.trim();
      })
      .filter(Boolean)
      .map(function (genreId) {
        return genreMap[String(genreId)];
      })
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  return "Movie";
}

function getMovieRatingValue(movie) {
  if (typeof movie.vote_average === "number") {
    return Number(movie.vote_average.toFixed(1));
  }

  if (typeof movie.averageRating === "number") {
    return Number(movie.averageRating.toFixed(1));
  }

  if (typeof movie.rating === "number") {
    return Number(movie.rating.toFixed(1));
  }

  return "N/A";
}

function mapApiMovie(movie, genreMap) {
  const movieId =
    movie.id ??
    movie.tmdbId ??
    movie.movieId ??
    movie.tmdb_id;

  return {
    id: movieId,
    tmdbId:
      movie.tmdbId ??
      movie.id ??
      movie.movieId ??
      movie.tmdb_id,
    title: movie.title ?? movie.name ?? "Unknown Movie",
    year: getYear(
      movie.release_date ??
      movie.releaseDate ??
      movie.first_air_date
    ),
    genre: getGenreLabel(movie, genreMap),
    rating: getMovieRatingValue(movie),
    description: movie.overview ?? movie.description ?? "",
    posterUrl: getPosterUrl(
      movie.poster_path ??
      movie.posterPath ??
      movie.posterUrl
    ),
    releaseDate:
      movie.release_date ??
      movie.releaseDate ??
      movie.first_air_date ??
      "",
  };
}

function extractMovieList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.movies)) {
    return data.movies;
  }

  return [];
}

function mapMovieResponse(response, genreMap, page) {
  const results = extractMovieList(response);

  const movies = results
    .map(function (movie) {
      return mapApiMovie(movie, genreMap);
    })
    .filter(function (movie) {
      return movie.id;
    });

  const responsePage =
    typeof response?.page === "number" ? response.page : page;

  const totalPages =
    typeof response?.total_pages === "number"
      ? response.total_pages
      : null;

  const hasNextPage =
    typeof response?.page === "number" &&
    typeof response?.total_pages === "number"
      ? response.page < response.total_pages
      : false;

  return {
    movies,
    page: responsePage || 1,
    totalPages,
    hasNextPage,
  };
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
    case "top-rated":
      return sortedMovies.sort(
        (a, b) => getMovieRating(b) - getMovieRating(a)
      );

    case "new-releases":
      return sortedMovies.sort(
        (a, b) => getMovieYear(b) - getMovieYear(a)
      );

    case "popular":
    case "recommended":
      return sortedMovies;

    case "rating-desc":
      return sortedMovies.sort(
        (a, b) => getMovieRating(b) - getMovieRating(a)
      );

    case "year-desc":
      return sortedMovies.sort(
        (a, b) => getMovieYear(b) - getMovieYear(a)
      );

    case "year-asc":
      return sortedMovies.sort(
        (a, b) => getMovieYear(a) - getMovieYear(b)
      );

    case "title-asc":
      return sortedMovies.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );

    case "relevance":
    default:
      return sortedMovies;
  }
}

async function loadMoviePage({
  searchTerm,
  genreId,
  sourceType,
  page,
}) {
  if (searchTerm) {
    return searchMovies(searchTerm, page);
  }

  if (genreId !== "all") {
    return fetchMoviesByGenre(genreId, page);
  }

  if (sourceType === "top-rated") {
    return fetchTopRatedMovies(page);
  }

  if (sourceType === "recommended") {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return fetchPopularMovies(page);
    }

    try {
      const recommendations = await fetchRecommendedMovies(
        currentUserId,
        MOVIES_PER_PAGE * 3
      );

      if (extractMovieList(recommendations).length === 0) {
        return fetchPopularMovies(page);
      }

      return recommendations;
    } catch (error) {
      console.warn("Recommended movies could not be loaded:", error);
      return fetchPopularMovies(page);
    }
  }

  return fetchPopularMovies(page);
}

function removeDuplicateMovies(movies) {
  const uniqueMovies = new Map();

  movies.forEach(function (movie) {
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
  sourceType,
  genreMap,
  shouldPrefetch,
  currentPage,
}) {
  const pagesToLoad =
    sourceType === "recommended"
      ? 1
      : shouldPrefetch
        ? BACKEND_PAGES_TO_PREFETCH
        : currentPage;

  const requests = [];

  for (let page = 1; page <= pagesToLoad; page += 1) {
    requests.push(
      loadMoviePage({
        searchTerm,
        genreId,
        sourceType,
        page,
      })
    );
  }

  const responses = await Promise.all(requests);

  const mappedResponses = responses.map(function (response, index) {
    return mapMovieResponse(response, genreMap, index + 1);
  });

  const allMovies = removeDuplicateMovies(
    mappedResponses.flatMap(function (response) {
      return response.movies;
    })
  );

  const lastResponse = mappedResponses[mappedResponses.length - 1];

  return {
    movies: allMovies,
    hasNextBackendPage:
      sourceType === "recommended"
        ? false
        : Boolean(lastResponse?.hasNextPage),
  };
}

function getIntroTitle(sourceType) {
  switch (sourceType) {
    case "recommended":
      return "Recommended Movies";

    case "top-rated":
      return "Top Rated Movies";

    case "new-releases":
      return "New Releases";

    case "popular":
    default:
      return "Search Movies";
  }
}

function getIntroText(sourceType) {
  switch (sourceType) {
    case "recommended":
      return "Explore personalized recommendations based on your movie activity.";

    case "top-rated":
      return "Explore movies with high ratings and adjust the filters if needed.";

    case "new-releases":
      return "Explore newer movies first and refine the results with filters.";

    case "popular":
    default:
      return "Explore movies with search, genre, year, rating and sorting options to quickly find titles that match your interests.";
  }
}

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

useEffect(() => {
  const filtersFromUrl = getFiltersFromSearchParams(searchParams);

  const sourceFromUrl = getValidSearchSource(
    searchParams.get("source")
  );

  const sourceFromSortBy = getSourceFromSortBy(filtersFromUrl.sortBy);

  const searchTermFromUrl = searchParams.get("query") || "";

  setActiveSource(
    searchParams.get("source") ? sourceFromUrl : sourceFromSortBy
  );
    setDraftFilters(filtersFromUrl);
    setActiveFilters(filtersFromUrl);
    setSearchInput(searchTermFromUrl);
    setSubmittedSearchTerm(searchTermFromUrl);
    setCurrentPage(1);
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

  const isUsingPrefetch =
    hasExtraFrontendFilters(activeFilters) ||
    activeSource === "new-releases" ||
    activeSource === "recommended";

  const hasNextLocalPage =
    currentPage * MOVIES_PER_PAGE < filteredAndSortedMovies.length;

  const hasNextPage = isUsingPrefetch
    ? hasNextLocalPage
    : hasNextLocalPage || hasNextBackendPage;

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
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [filterName]: value,
    }));
  }

  function handleApplyFilters() {
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
          <h2>{getIntroTitle(activeSource)}</h2>
          <p>{getIntroText(activeSource)}</p>
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
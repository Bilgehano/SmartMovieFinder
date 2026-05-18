import { useMemo, useState } from "react";
import { mockMovies } from "../data/mockMovies";
import BrowseFilterBar from "../components/browse/BrowseFilterBar";
import BrowseMovieGrid from "../components/browse/BrowseMovieGrid";
import BrowsePagination from "../components/browse/BrowsePagination";
import SearchBar from "../components/SearchBar";
import "./MovieSearchPage.css";

const MOVIES_PER_PAGE = 20;

function getMovieGenres(movie) {
  if (Array.isArray(movie.genres)) {
    return movie.genres;
  }

  if (movie.genre) {
    return [movie.genre];
  }

  return [];
}

function getMovieRating(movie) {
  return Number(movie.rating || movie.averageRating || 0);
}

function getMovieYear(movie) {
  return Number(movie.year || 0);
}

function matchesSearch(movie, searchTerm) {
  const searchValue = searchTerm.toLowerCase().trim();

  if (!searchValue) {
    return true;
  }

  const title = String(movie.title || "").toLowerCase();
  const genreText = getMovieGenres(movie).join(" ").toLowerCase();

  return title.includes(searchValue) || genreText.includes(searchValue);
}

function matchesFilters(movie, filters) {
  const movieGenres = getMovieGenres(movie);
  const movieYear = getMovieYear(movie);
  const movieRating = getMovieRating(movie);

  const matchesGenre =
    filters.genre === "all" || movieGenres.includes(filters.genre);

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

export default function MovieSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [draftFilters, setDraftFilters] = useState({
    genre: "all",
    yearFrom: "",
    yearTo: "",
    rating: "all",
    sortBy: "relevance",
  });

  const [activeFilters, setActiveFilters] = useState(draftFilters);
  const [currentPage, setCurrentPage] = useState(1);

  const availableGenres = useMemo(() => {
    const genreSet = new Set();

    mockMovies.forEach((movie) => {
      getMovieGenres(movie).forEach((genre) => {
        genreSet.add(genre);
      });
    });

    return Array.from(genreSet).sort();
  }, []);

  const filteredMovies = useMemo(() => {
    const matchingMovies = mockMovies.filter((movie) => {
      return (
        matchesSearch(movie, searchTerm) && matchesFilters(movie, activeFilters)
      );
    });

    return sortMovies(matchingMovies, activeFilters.sortBy);
  }, [searchTerm, activeFilters]);

  const visibleMovies = filteredMovies.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  const hasNextPage = currentPage * MOVIES_PER_PAGE < filteredMovies.length;

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
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
    setSearchTerm("");
    setCurrentPage(1);
  }

  return (
    <main className="movie-search-page">
      <section className="movie-search-top">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
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
          <h1>Search Movies</h1>
          <p>
            Explore movies with search, genre, year, rating and sorting options
            to quickly find titles that match your interests.
          </p>
        </div>

        <BrowseMovieGrid movies={visibleMovies} />

        <BrowsePagination
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  );
}
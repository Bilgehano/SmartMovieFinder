import { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import BrowseMovieGrid from "../components/browse/BrowseMovieGrid";
import BrowsePagination from "../components/browse/BrowsePagination";
import LibraryTabs from "../components/library/LibraryTabs";
import LibraryOverview from "../components/library/LibraryOverview";
import FavoriteGenresPanel from "../components/library/FavoriteGenresPanel";
import { mockFavoriteGenres, mockLibraryMovies } from "../data/mockLibraryMovies";
import "./UserLibraryPage.css";

const MOVIES_PER_PAGE = 8;

function movieMatchesSearch(movie, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  return (
    movie.title.toLowerCase().includes(normalizedSearchTerm) ||
    movie.genre.toLowerCase().includes(normalizedSearchTerm)
  );
}

function getMoviesByTab(movies, activeTab) {
  switch (activeTab) {
    case "watched":
      return movies.filter((movie) => movie.status.includes("watched"));

    case "rated":
      return movies.filter((movie) => movie.status.includes("rated"));

    case "recent":
      return [...movies].sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
      );

    case "all":
    default:
      return movies;
  }
}

function UserLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const watchedMoviesCount = mockLibraryMovies.filter((movie) =>
    movie.status.includes("watched")
  ).length;

  const ratedMoviesCount = mockLibraryMovies.filter((movie) =>
    movie.status.includes("rated")
  ).length;

  const filteredMovies = useMemo(() => {
    const tabMovies = getMoviesByTab(mockLibraryMovies, activeTab);

    return tabMovies.filter((movie) => movieMatchesSearch(movie, searchTerm));
  }, [activeTab, searchTerm]);

  const visibleMovies = useMemo(() => {
    return filteredMovies.slice(
      (currentPage - 1) * MOVIES_PER_PAGE,
      currentPage * MOVIES_PER_PAGE
    );
  }, [filteredMovies, currentPage]);

  const hasNextPage = currentPage * MOVIES_PER_PAGE < filteredMovies.length;

  function handleSearchChange(value) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  function handleSearchSubmit(value) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setCurrentPage(1);
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
        <LibraryTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <section className="library-intro">
          <div>
            <h2>My Library</h2>
            <p>
              Manage your watched movies, rated movies, favorite genres and
              recently added titles in one place.
            </p>
          </div>

          <LibraryOverview
            totalMovies={mockLibraryMovies.length}
            watchedMovies={watchedMoviesCount}
            ratedMovies={ratedMoviesCount}
          />
        </section>

        {activeTab === "genres" ? (
          <FavoriteGenresPanel genres={mockFavoriteGenres} />
        ) : (
          <>
            <BrowseMovieGrid movies={visibleMovies} />

            {filteredMovies.length > 0 && (
              <BrowsePagination
                currentPage={currentPage}
                hasNextPage={hasNextPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default UserLibraryPage;
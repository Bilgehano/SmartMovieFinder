import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import MovieGraph from "../features/movieGraph/MovieGraph";
import {
  fetchMovieDetail,
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchSimilarMovies,
  fetchTopRatedMovies,
  searchMovies,
} from "../api/movieApi";
import {
  getFirstSearchResult,
  getPrimaryGenreId,
  mapBackendDataToMovieGraph,
} from "../features/movieGraph/movieGraphMapper";

import "./MovieGraphPage.css";

function getSettledValue(result, fallbackValue) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  return fallbackValue;
}

function MovieGraphPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [currentGraphData, setCurrentGraphData] = useState(null);
  const [graphSearchMessage, setGraphSearchMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadGraphData() {
      if (!movieId) {
        setCurrentGraphData(null);
        setGraphSearchMessage(
          "Search for a movie or open a graph from a movie detail page."
        );
        return;
      }

      setIsLoading(true);
      setErrorMessage("");
      setGraphSearchMessage("");

      try {
        const movieDetail = await fetchMovieDetail(movieId);
        const primaryGenreId = getPrimaryGenreId(movieDetail);

        const [
          similarResult,
          sameGenreResult,
          genrePicksResult,
          recommendationsResult,
          topRatedResult,
        ] = await Promise.allSettled([
          fetchSimilarMovies(movieId, 5),
          primaryGenreId ? fetchMoviesByGenre(primaryGenreId, 1) : [],
          primaryGenreId ? fetchMoviesByGenre(primaryGenreId, 2) : [],
          fetchPopularMovies(2),
          fetchTopRatedMovies(1),
        ]);

        if (!isMounted) {
          return;
        }

        const graphData = mapBackendDataToMovieGraph({
          movieDetail,
          sameGenreMovies: getSettledValue(sameGenreResult, []),
          similarMovies: getSettledValue(similarResult, []),
          recommendations: getSettledValue(recommendationsResult, []),
          genrePicks: getSettledValue(genrePicksResult, []),
          topRatedMovies: getSettledValue(topRatedResult, []),
        });

        setCurrentGraphData(graphData);
      } catch (error) {
        console.error("Failed to load movie graph:", error);

        if (!isMounted) {
          return;
        }

        setCurrentGraphData(null);
        setErrorMessage("Could not load the movie graph from the backend.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadGraphData();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  async function handleGraphSearchSubmit(value) {
    const searchTerm = value.trim();

    if (!searchTerm) {
      setGraphSearchMessage("Please enter a movie title.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setGraphSearchMessage("");

    try {
      const searchResponse = await searchMovies(searchTerm, 1);
      const firstMovie = getFirstSearchResult(searchResponse);

      if (!firstMovie) {
        setGraphSearchMessage("No movie found for this search term.");
        return;
      }

      navigate(`/movies/${firstMovie.id}/graph`);
    } catch (error) {
      console.error("Failed to search movie graph:", error);
      setGraphSearchMessage("Could not search for this movie graph.");
    } finally {
      setIsLoading(false);
    }
  }

  const backMovieId = currentGraphData?.center?.movieId ?? movieId;
  const graphTitle = currentGraphData
    ? `${currentGraphData.center.label} Graph`
    : "Movie Graph";

  return (
    <main className="movie-graph-page">
      <section className="movie-graph-search-section">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleGraphSearchSubmit}
          placeholder="Search for a movie graph..."
        />
      </section>

      <section className="movie-graph-shell">
        <div className="movie-graph-page-header">
          <div>
            <p className="movie-graph-kicker">Movie Mindmap</p>
            <h1>{graphTitle}</h1>
            <p>
              Explore how this movie connects to genres, similar movies,
              recommendations and top rated movie areas.
            </p>

            {graphSearchMessage && (
              <p className="movie-graph-search-message">
                {graphSearchMessage}
              </p>
            )}
          </div>

          {backMovieId && (
            <Link
              className="movie-graph-back-link"
              to={`/movies/${backMovieId}`}
            >
              Open Movie Details
            </Link>
          )}
        </div>

        {errorMessage && (
          <div className="movie-graph-state-card movie-graph-state-error">
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="movie-graph-state-card">
            Loading movie graph...
          </div>
        )}

        {!isLoading && !errorMessage && currentGraphData && (
          <MovieGraph graphData={currentGraphData} />
        )}

        {!isLoading && !errorMessage && !currentGraphData && (
          <div className="movie-graph-state-card">
            Search for a movie to build a graph or open the graph from a movie
            detail page.
          </div>
        )}
      </section>
    </main>
  );
}

export default MovieGraphPage;
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import SearchBar from "../components/shared/SearchBar";
import MovieGraph from "../features/movieGraph/MovieGraph";

import {
  fetchMovieDetail,
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchSimilarMovies,
  searchMovies,
} from "../api/movieApi";

import { fetchRecommendedMovies } from "../api/recommendationApi";

import { getCurrentUserId } from "../api/userSession";

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

function normalizeMovieList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

function hasMovies(response) {
  return normalizeMovieList(response).length > 0;
}

async function fetchGraphRecommendations(userId) {
  if (!userId) {
    return fetchPopularMovies(2);
  }

  try {
    const recommendations = await fetchRecommendedMovies(
      userId,
      5
    );

    if (hasMovies(recommendations)) {
      return recommendations;
    }
  } catch (error) {
    console.warn(
      "Graph recommendations could not be loaded:",
      error
    );
  }

  return fetchPopularMovies(2);
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
        const currentUserId = getCurrentUserId();

        const [
          similarResult,
          sameGenreResult,
          recommendationsResult,
        ] = await Promise.allSettled([
          fetchSimilarMovies(movieId, 5),

          primaryGenreId
            ? fetchMoviesByGenre(primaryGenreId, 1)
            : [],

          fetchGraphRecommendations(currentUserId),
        ]);

        if (!isMounted) {
          return;
        }

        const graphData = mapBackendDataToMovieGraph({
          movieDetail,
          sameGenreMovies: getSettledValue(sameGenreResult, []),
          similarMovies: getSettledValue(similarResult, []),
          recommendations: getSettledValue(
            recommendationsResult,
            []
          ),
        });

        setCurrentGraphData(graphData);
      } catch (error) {
        console.error("Failed to load movie graph:", error);

        if (!isMounted) {
          return;
        }

        setCurrentGraphData(null);
        setErrorMessage(
          "Could not load the movie graph from the backend."
        );
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
        setGraphSearchMessage(
          "No movie found for this search term."
        );
        return;
      }

      navigate(`/movies/${firstMovie.id}/graph`);
    } catch (error) {
      console.error("Failed to search movie graph:", error);

      setGraphSearchMessage(
        "Could not search for this movie graph."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const backMovieId =
    currentGraphData?.center?.movieId ?? movieId;

  const graphTitle = currentGraphData
    ? `${currentGraphData.center.label} Graph`
    : "Movie Graph";

  return (
    <main className="movie-graph-page">
      <section className="movie-graph-header">
        <div className="movie-graph-header-content">
          <div className="movie-graph-header-top">
            <div className="movie-graph-intro">
              <span className="movie-graph-kicker">
                Movie Mindmap
              </span>

              <h1>{graphTitle}</h1>

              <p>
                Explore how this movie connects to movies from
                the same genre, similar movies and recommendations.
              </p>
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

          <div className="movie-graph-header-search">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleGraphSearchSubmit}
              placeholder="Search for a movie graph..."
            />
          </div>

          <div className="movie-graph-header-divider" />

          {graphSearchMessage && (
            <p className="movie-graph-search-message">
              {graphSearchMessage}
            </p>
          )}
        </div>
      </section>

      <section className="movie-graph-shell">
        {errorMessage && (
          <div className="movie-graph-state-card movie-graph-state-error">
            <h2>Graph could not be loaded</h2>
            <p>{errorMessage}</p>
          </div>
        )}

        {isLoading && (
          <div className="movie-graph-state-card">
            <h2>Loading movie graph</h2>
            <p>Please wait while the movie connections are loaded.</p>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          currentGraphData && (
            <MovieGraph graphData={currentGraphData} />
          )}

        {!isLoading &&
          !errorMessage &&
          !currentGraphData && (
            <div className="movie-graph-state-card">
              <h2>Build a movie graph</h2>
              <p>
                Search for a movie above or open a graph from a
                movie detail page.
              </p>
            </div>
          )}
      </section>
    </main>
  );
}

export default MovieGraphPage;
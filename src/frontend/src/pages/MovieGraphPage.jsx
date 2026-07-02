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

const MIN_SUGGESTION_LENGTH = 2;
const MAX_SUGGESTIONS = 5;
const SUGGESTION_DELAY_MS = 300;

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

function getSuggestionMovieId(movie) {
  return movie?.id ?? movie?.tmdbId ?? movie?.movieId ?? null;
}

function getSuggestionTitle(movie) {
  return (
    movie?.title ||
    movie?.name ||
    movie?.label ||
    "Unknown Movie"
  );
}

function getSuggestionYear(movie) {
  const releaseDate =
    movie?.release_date ||
    movie?.releaseDate ||
    movie?.first_air_date;

  return releaseDate ? String(releaseDate).slice(0, 4) : "Unknown";
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

  const [graphSuggestions, setGraphSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] =
    useState(false);
  const [isSuggestionListOpen, setIsSuggestionListOpen] =
    useState(false);

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

  useEffect(() => {
    const trimmedSearchTerm = searchInput.trim();

    if (trimmedSearchTerm.length < MIN_SUGGESTION_LENGTH) {
      setGraphSuggestions([]);
      setIsSuggestionsLoading(false);
      setIsSuggestionListOpen(false);
      return undefined;
    }

    let isCancelled = false;

    setIsSuggestionsLoading(true);
    setIsSuggestionListOpen(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const searchResponse = await searchMovies(
          trimmedSearchTerm,
          1
        );

        if (isCancelled) {
          return;
        }

        const suggestions = normalizeMovieList(searchResponse)
          .filter((movie) => getSuggestionMovieId(movie))
          .slice(0, MAX_SUGGESTIONS);

        setGraphSuggestions(suggestions);
      } catch (error) {
        console.warn(
          "Graph search suggestions could not be loaded:",
          error
        );

        if (!isCancelled) {
          setGraphSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSuggestionsLoading(false);
        }
      }
    }, SUGGESTION_DELAY_MS);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  async function handleGraphSearchSubmit(value) {
    const searchTerm = value.trim();

    setIsSuggestionListOpen(false);
    setGraphSuggestions([]);

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

  function handleGraphSearchChange(value) {
    setSearchInput(value);
    setGraphSearchMessage("");
  }

  function handleSuggestionSelect(movie) {
    const selectedMovieId = getSuggestionMovieId(movie);

    if (!selectedMovieId) {
      return;
    }

    setSearchInput(getSuggestionTitle(movie));
    setGraphSuggestions([]);
    setIsSuggestionListOpen(false);
    setGraphSearchMessage("");

    navigate(`/movies/${selectedMovieId}/graph`);
  }

  const backMovieId =
    currentGraphData?.center?.movieId ?? movieId;

  const graphTitle = currentGraphData
    ? `${currentGraphData.center.label} Graph`
    : "Movie Graph";

  const shouldShowSuggestions =
    isSuggestionListOpen &&
    searchInput.trim().length >= MIN_SUGGESTION_LENGTH &&
    (isSuggestionsLoading || graphSuggestions.length > 0);

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
            <div className="movie-graph-search-wrapper">
              <SearchBar
                value={searchInput}
                onChange={handleGraphSearchChange}
                onSubmit={handleGraphSearchSubmit}
                placeholder="Search for a movie graph..."
              />

              {shouldShowSuggestions && (
                <div
                  className="movie-graph-suggestions"
                  role="listbox"
                  aria-label="Movie suggestions"
                >
                  {isSuggestionsLoading && (
                    <div className="movie-graph-suggestion-status">
                      Searching movies...
                    </div>
                  )}

                  {!isSuggestionsLoading &&
                    graphSuggestions.map((movie) => {
                      const suggestionId =
                        getSuggestionMovieId(movie);

                      return (
                        <button
                          key={suggestionId}
                          type="button"
                          className="movie-graph-suggestion"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleSuggestionSelect(movie);
                          }}
                        >
                          <span className="movie-graph-suggestion-title">
                            {getSuggestionTitle(movie)}
                          </span>

                          <span className="movie-graph-suggestion-year">
                            {getSuggestionYear(movie)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
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
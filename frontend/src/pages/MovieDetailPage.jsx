import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { mockCommunityRatings } from "../data/mockCommunityRatings";
import {
  fetchGenres,
  fetchMovieDetail,
  fetchSimilarMovies,
} from "../api/movieApi";
import {
  addWatchedMovie,
  addWatchLaterMovie,
  deleteMovieRating,
  fetchUserRatings,
  fetchWatchedMovies,
  fetchWatchLaterMovies,
  removeWatchedMovie,
  removeWatchLaterMovie,
  saveMovieRating,
} from "../api/userApi";
import { getCurrentUserId } from "../api/userSession";
import {
  createGenreMap,
  mapTmdbMovieDetail,
  mapTmdbMovieList,
} from "../utils/movieMapper";

import MovieDetailBar from "../components/movie-detail-page/MovieDetailBar";
import MovieDetailSection from "../components/movie-detail-page/MovieDetailSection";
import CommunityRatingSection from "../components/movie-detail-page/CommunityRatingSection";
import MovieRecommendationSection from "../components/movie-detail-page/MovieRecommendationSection";

import "./MovieDetailPage.css";

function normalizeId(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function getMovieIds(movie) {
  if (!movie) {
    return [];
  }

  return [movie.id, movie.tmdbId, movie.movieId]
    .map(normalizeId)
    .filter(Boolean);
}

function getUserMovieIds(item) {
  if (!item) {
    return [];
  }

  const nestedMovie = item.movie || item.catalogMovie || item.tmdbMovie;

  return [
    item.id,
    item.tmdbId,
    item.movieId,
    item.catalogMovieId,
    item.tmdbMovieId,
    nestedMovie?.id,
    nestedMovie?.tmdbId,
    nestedMovie?.movieId,
  ]
    .map(normalizeId)
    .filter(Boolean);
}

function isSameMovie(movie, userMovieItem) {
  const movieIds = getMovieIds(movie);
  const userMovieIds = getUserMovieIds(userMovieItem);

  return movieIds.some((movieId) =>
    userMovieIds.includes(movieId)
  );
}

function findMatchingItem(items, movie) {
  if (!Array.isArray(items)) {
    return null;
  }

  return items.find((item) => isSameMovie(movie, item)) || null;
}

function getRatingValue(ratingItem) {
  if (!ratingItem) {
    return null;
  }

  const rawRating =
    ratingItem.rating ??
    ratingItem.ratingValue ??
    ratingItem.value ??
    ratingItem.score;

  const numericRating = Number(rawRating);

  return Number.isFinite(numericRating) ? numericRating : null;
}

function getMovieTmdbId(movie) {
  if (!movie) {
    return null;
  }

  return movie.tmdbId ?? movie.id ?? movie.movieId;
}

function MovieDetailPage() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [savedRating, setSavedRating] = useState(null);
  const [watchStatus, setWatchStatus] = useState("Not watched");
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userStatusMessage, setUserStatusMessage] = useState("");
  const [isUserActionSaving, setIsUserActionSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMovieDetails() {
      setIsLoading(true);
      setErrorMessage("");
      setUserStatusMessage("");
      setMovie(null);
      setRecommendedMovies([]);
      setWatchStatus("Not watched");
      setIsWatchLater(false);
      setSelectedRating(null);
      setSavedRating(null);
      setIsUserActionSaving(false);

      try {
        const currentUserId = getCurrentUserId();

        const watchedMoviesRequest = currentUserId
          ? fetchWatchedMovies(currentUserId)
          : Promise.resolve([]);

        const watchLaterMoviesRequest = currentUserId
          ? fetchWatchLaterMovies(currentUserId)
          : Promise.resolve([]);

        const userRatingsRequest = currentUserId
          ? fetchUserRatings(currentUserId)
          : Promise.resolve([]);

        const [
          movieDetailResult,
          genresResult,
          similarMoviesResult,
          watchedMoviesResult,
          watchLaterMoviesResult,
          userRatingsResult,
        ] = await Promise.allSettled([
          fetchMovieDetail(movieId),
          fetchGenres(),
          fetchSimilarMovies(movieId, 4),
          watchedMoviesRequest,
          watchLaterMoviesRequest,
          userRatingsRequest,
        ]);

        if (movieDetailResult.status !== "fulfilled") {
          throw movieDetailResult.reason;
        }

        const genres =
          genresResult.status === "fulfilled"
            ? genresResult.value
            : [];

        const similarMoviesResponse =
          similarMoviesResult.status === "fulfilled"
            ? similarMoviesResult.value
            : [];

        const watchedMovies =
          watchedMoviesResult.status === "fulfilled"
            ? watchedMoviesResult.value
            : [];

        const watchLaterMovies =
          watchLaterMoviesResult.status === "fulfilled"
            ? watchLaterMoviesResult.value
            : [];

        const userRatings =
          userRatingsResult.status === "fulfilled"
            ? userRatingsResult.value
            : [];

        const genreMap = createGenreMap(genres);

        const mappedMovie = mapTmdbMovieDetail(
          movieDetailResult.value,
          genreMap
        );

        const mappedRecommendations = mapTmdbMovieList(
          similarMoviesResponse,
          genreMap
        )
          .filter(
            (recommendedMovie) =>
              String(recommendedMovie.id) !== String(mappedMovie.id)
          )
          .slice(0, 4);

        const watchedItem = findMatchingItem(watchedMovies, mappedMovie);
        const watchLaterItem = findMatchingItem(
          watchLaterMovies,
          mappedMovie
        );
        const ratingItem = findMatchingItem(userRatings, mappedMovie);
        const existingRating = getRatingValue(ratingItem);

        if (!isMounted) {
          return;
        }

        setMovie(mappedMovie);
        setRecommendedMovies(mappedRecommendations);
        setWatchStatus(watchedItem ? "Watched" : "Not watched");
        setIsWatchLater(Boolean(watchLaterItem));
        setSelectedRating(existingRating);
        setSavedRating(existingRating);

        if (!currentUserId) {
          setUserStatusMessage(
            "Login is required to load your personal movie status."
          );
        } else if (
          watchedMoviesResult.status === "rejected" ||
          watchLaterMoviesResult.status === "rejected" ||
          userRatingsResult.status === "rejected"
        ) {
          setUserStatusMessage(
            "Some personal movie data could not be loaded."
          );
        }
      } catch (error) {
        console.error("Failed to load movie details:", error);

        if (!isMounted) {
          return;
        }

        setMovie(null);
        setRecommendedMovies([]);
        setErrorMessage("Could not load this movie from the backend.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMovieDetails();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  async function handleWatchStatus() {
    if (!movie || isUserActionSaving) {
      return;
    }

    const currentUserId = getCurrentUserId();
    const tmdbId = getMovieTmdbId(movie);

    if (!currentUserId || !tmdbId) {
      setUserStatusMessage("Login is required to update your movie status.");
      return;
    }

    setIsUserActionSaving(true);
    setUserStatusMessage("");

    try {
      if (watchStatus === "Watched") {
        await removeWatchedMovie(currentUserId, tmdbId);
        setWatchStatus("Not watched");
      } else {
        await addWatchedMovie(currentUserId, movie);
        setWatchStatus("Watched");
        setIsWatchLater(false);
      }
    } catch (error) {
      console.error("Failed to update watched status:", error);
      setUserStatusMessage("Could not update watched status.");
    } finally {
      setIsUserActionSaving(false);
    }
  }

  async function handleWatchLaterStatus() {
    if (!movie || isUserActionSaving) {
      return;
    }

    const currentUserId = getCurrentUserId();
    const tmdbId = getMovieTmdbId(movie);

    if (!currentUserId || !tmdbId) {
      setUserStatusMessage("Login is required to update watch later.");
      return;
    }

    setIsUserActionSaving(true);
    setUserStatusMessage("");

    try {
      if (isWatchLater) {
        await removeWatchLaterMovie(currentUserId, tmdbId);
        setIsWatchLater(false);
      } else {
        await addWatchLaterMovie(currentUserId, movie);
        setIsWatchLater(true);
      }
    } catch (error) {
      console.error("Failed to update watch later:", error);
      setUserStatusMessage("Could not update watch later.");
    } finally {
      setIsUserActionSaving(false);
    }
  }

  async function handleSaveRating() {
    if (!selectedRating || !movie || isUserActionSaving) {
      return;
    }

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setUserStatusMessage("Login is required to save your rating.");
      return;
    }

    setIsUserActionSaving(true);
    setUserStatusMessage("");

    try {
      await saveMovieRating(currentUserId, movie, selectedRating);
      setSavedRating(selectedRating);
    } catch (error) {
      console.error("Failed to save rating:", error);
      setUserStatusMessage("Could not save your rating.");
    } finally {
      setIsUserActionSaving(false);
    }
  }

  async function handleDeleteRating() {
    if (!movie || !savedRating || isUserActionSaving) {
      return;
    }

    const currentUserId = getCurrentUserId();
    const tmdbId = getMovieTmdbId(movie);

    if (!currentUserId || !tmdbId) {
      setUserStatusMessage("Login is required to delete your rating.");
      return;
    }

    setIsUserActionSaving(true);
    setUserStatusMessage("");

    try {
      await deleteMovieRating(currentUserId, tmdbId);
      setSelectedRating(null);
      setSavedRating(null);
    } catch (error) {
      console.error("Failed to delete rating:", error);
      setUserStatusMessage("Could not delete your rating.");
    } finally {
      setIsUserActionSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="movie-detail-page">
        <section className="movie-detail-shell">
          <div className="movie-detail-stack">
            <MovieDetailBar showSectionLinks={false} />

            <div className="movie-detail-panel movie-detail-error-panel">
              <p className="movie-detail-empty">Loading movie details...</p>
              <p className="movie-detail-empty-text">
                Please wait while the movie data is loaded from the backend.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-detail-page">
        <section className="movie-detail-shell">
          <div className="movie-detail-stack">
            <MovieDetailBar showSectionLinks={false} />

            <div className="movie-detail-panel movie-detail-error-panel">
              <p className="movie-detail-empty">Movie not found.</p>
              <p className="movie-detail-empty-text">
                {errorMessage ||
                  "The selected movie could not be loaded from the backend."}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <section className="movie-detail-shell">
        <div className="movie-detail-stack">
          <MovieDetailBar movieId={movie.id} />

          <div className="movie-detail-panel">
            {userStatusMessage && (
              <p className="movie-detail-user-status-message">
                {userStatusMessage}
              </p>
            )}

            <MovieDetailSection
              movie={movie}
              watchStatus={watchStatus}
              isWatchLater={isWatchLater}
              selectedRating={selectedRating}
              savedRating={savedRating}
              isUserActionSaving={isUserActionSaving}
              onWatchStatusToggle={handleWatchStatus}
              onWatchLaterToggle={handleWatchLaterStatus}
              onRatingSelect={setSelectedRating}
              onSaveRating={handleSaveRating}
              onDeleteRating={handleDeleteRating}
            />

            <section className="movie-detail-extra-section">
              <CommunityRatingSection
                ratings={mockCommunityRatings}
                averageRating={movie.rating}
              />

              <div className="movie-detail-sub-divider" />

              <MovieRecommendationSection
                recommendedMovies={recommendedMovies}
              />
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MovieDetailPage;
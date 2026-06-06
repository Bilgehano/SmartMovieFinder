import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { mockCommunityRatings } from "../data/mockCommunityRatings";
import {
  fetchGenres,
  fetchMovieDetail,
  fetchSimilarMovies,
} from "../api/movieApi";
import {
  createGenreMap,
  mapTmdbMovieDetail,
  mapTmdbMovieList,
} from "../utils/movieMapper";

import MovieDetailBar from "../components/movie-detail/MovieDetailBar";
import MovieDetailSection from "../components/movie-detail/MovieDetailSection";
import CommunityRatingSection from "../components/movie-detail/CommunityRatingSection";
import MovieRecommendationSection from "../components/movie-detail/MovieRecommendationSection";

import "./MovieDetailPage.css";

function MovieDetailPage() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [watchStatus, setWatchStatus] = useState("Not watched");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMovieDetails() {
      setIsLoading(true);
      setErrorMessage("");
      setMovie(null);
      setRecommendedMovies([]);

      try {
        const [movieDetailResult, genresResult, similarMoviesResult] =
          await Promise.allSettled([
            fetchMovieDetail(movieId),
            fetchGenres(),
            fetchSimilarMovies(movieId, 4),
          ]);

        if (movieDetailResult.status !== "fulfilled") {
          throw movieDetailResult.reason;
        }

        const genres =
          genresResult.status === "fulfilled" ? genresResult.value : [];

        const similarMoviesResponse =
          similarMoviesResult.status === "fulfilled"
            ? similarMoviesResult.value
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

        if (!isMounted) {
          return;
        }

        setMovie(mappedMovie);
        setRecommendedMovies(mappedRecommendations);
        setWatchStatus(mappedMovie.status);
        setSelectedRating(null);
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

  function handleWatchStatus() {
    setWatchStatus((currentStatus) =>
      currentStatus === "Watched" ? "Not watched" : "Watched"
    );
  }

  function handleSaveRating() {
    if (!selectedRating || !movie) {
      return;
    }

    console.log("Saved rating:", {
      movieId: movie.id,
      rating: selectedRating,
    });
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
            <MovieDetailSection
              movie={movie}
              watchStatus={watchStatus}
              selectedRating={selectedRating}
              onWatchStatusToggle={handleWatchStatus}
              onRatingSelect={setSelectedRating}
              onSaveRating={handleSaveRating}
            />

            <section className="movie-detail-extra-section">
              <CommunityRatingSection ratings={mockCommunityRatings} />

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
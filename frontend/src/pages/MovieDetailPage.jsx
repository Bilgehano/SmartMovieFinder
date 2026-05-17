import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { mockMovies } from "../data/mockMovies";
import { mockCommunityRatings } from "../data/mockCommunityRatings";

import MovieDetailBar from "../components/movie-detail/MovieDetailBar";
import MovieDetailSection from "../components/movie-detail/MovieDetailSection";
import CommunityRatingSection from "../components/movie-detail/CommunityRatingSection";
import MovieRecommendationSection from "../components/movie-detail/MovieRecommendationSection";

import "./MovieDetailPage.css";

function normalizeMovie(movie) {
  if (!movie) return null;

  return {
    id: movie.id,
    title: movie.title ?? "Unknown Movie",
    year: movie.year ?? "2024",
    genre: movie.genre ?? "Unknown Genre",
    rating: movie.rating ?? "N/A",
    description:
      movie.description ??
      "A short movie description will be displayed here. Later this text can come from the backend or TMDB.",
    status: movie.status ?? "Not watched",
  };
}

function MovieDetailPage() {
  const { movieId } = useParams();

  const movie = useMemo(() => {
    const foundMovie = mockMovies.find(
      (item) => String(item.id) === String(movieId)
    );

    return normalizeMovie(foundMovie);
  }, [movieId]);

  const recommendedMovies = useMemo(() => {
    if (!movie) return [];

    return mockMovies
      .filter((item) => String(item.id) !== String(movie.id))
      .slice(0, 4);
  }, [movie]);

  const [selectedRating, setSelectedRating] = useState(null);
  const [watchStatus, setWatchStatus] = useState("Not watched");

  useEffect(() => {
    if (movie) {
      setWatchStatus(movie.status);
      setSelectedRating(null);
    }
  }, [movie]);

  function handleWatchStatus() {
    setWatchStatus((currentStatus) =>
      currentStatus === "Watched" ? "Not watched" : "Watched"
    );
  }

  function handleSaveRating() {
    if (!selectedRating || !movie) return;

    console.log("Saved rating:", {
      movieId: movie.id,
      rating: selectedRating,
    });
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
                The selected movie does not exist in the mock data yet.
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
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mockMovies } from "../data/mockMovies";
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

  const [selectedRating, setSelectedRating] = useState(null);
  const [watchStatus, setWatchStatus] = useState("Not watched");

  useEffect(() => {
    if (movie) {
      setWatchStatus(movie.status);
      setSelectedRating(null);
    }
  }, [movie]);

  if (!movie) {
    return (
      <main className="movie-detail-page">
        <section className="movie-detail-shell">
          <div className="movie-detail-panel">
            <p className="movie-detail-empty">Movie not found.</p>

            <Link className="movie-detail-back-link" to="/homepage">
              Back to homepage
            </Link>
          </div>
        </section>
      </main>
    );
  }

  function handleMarkAsWatched() {
    setWatchStatus("Watched");
  }

  function handleSaveRating() {
    if (!selectedRating) return;

    console.log("Saved rating:", {
      movieId: movie.id,
      rating: selectedRating,
    });
  }

  return (
    <main className="movie-detail-page">
      <section className="movie-detail-shell">
        <div className="movie-detail-panel">
          <div className="movie-detail-top">
            <aside className="movie-detail-poster-column">
              <div className="movie-detail-poster">
                <span>{movie.title.charAt(0)}</span>
              </div>

              <div className="movie-detail-status-card">
                <span className="movie-detail-status-label">Status</span>
                <strong>{watchStatus}</strong>
              </div>

              <button
                className="movie-detail-outline-button"
                type="button"
                onClick={handleMarkAsWatched}
              >
                Mark as watched
              </button>

              <Link className="movie-detail-back-link" to="/homepage">
                Back to homepage
              </Link>
            </aside>

            <section className="movie-detail-info">
              <div className="movie-detail-title-area">
                <p className="movie-detail-eyebrow">Movie Detail</p>

                <h1>{movie.title}</h1>

                <div className="movie-detail-meta">
                  <span>{movie.genre}</span>
                  <span>{movie.year}</span>
                  <span>★ {movie.rating}</span>
                </div>
              </div>

              <div className="movie-detail-description-card">
                <h2>Details about Movie</h2>
                <p>{movie.description}</p>
              </div>

              <div className="movie-detail-rating-card">
                <div className="movie-detail-rating-header">
                  <div>
                    <h3>Your Rating</h3>
                    <p>Choose how much you liked this movie.</p>
                  </div>

                  {selectedRating && (
                    <span className="movie-detail-selected-rating">
                      {selectedRating}/5
                    </span>
                  )}
                </div>

                <div className="movie-detail-rating-options">
                  {[1, 2, 3, 4, 5].map((ratingValue) => (
                    <button
                      key={ratingValue}
                      className={
                        selectedRating === ratingValue
                          ? "movie-detail-rating-box is-selected"
                          : "movie-detail-rating-box"
                      }
                      type="button"
                      onClick={() => setSelectedRating(ratingValue)}
                      aria-label={`Rate movie with ${ratingValue} out of 5`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <button
                  className="movie-detail-primary-button"
                  type="button"
                  onClick={handleSaveRating}
                  disabled={!selectedRating}
                >
                  Save Rating
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MovieDetailPage;
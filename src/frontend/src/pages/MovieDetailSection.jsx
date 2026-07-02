import { Star, Trash2 } from "lucide-react";
import "./MovieDetailSection.css";

function MovieDetailSection({
  movie,
  watchStatus,
  isWatchLater,
  selectedRating,
  savedRating,
  isUserActionSaving,
  onWatchStatusToggle,
  onWatchLaterToggle,
  onRatingSelect,
  onSaveRating,
  onDeleteRating,
}) {
  const hasSavedRating = typeof savedRating === "number";

  return (
    <>
      <div className="movie-detail-top">
        <aside className="movie-detail-poster-column">
          <div className="movie-detail-poster">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} />
            ) : (
              <span>{movie.title.charAt(0)}</span>
            )}
          </div>

          <div className="movie-detail-poster-actions">
            <button
              className={
                watchStatus === "Watched"
                  ? "movie-detail-outline-button is-active"
                  : "movie-detail-outline-button"
              }
              type="button"
              onClick={onWatchStatusToggle}
              disabled={isUserActionSaving}
            >
              {isUserActionSaving
                ? "Saving..."
                : watchStatus === "Watched"
                  ? "✓ Watched"
                  : "+ Mark as watched"}
            </button>

            <button
              className={
                isWatchLater
                  ? "movie-detail-outline-button is-active"
                  : "movie-detail-outline-button"
              }
              type="button"
              onClick={onWatchLaterToggle}
              disabled={isUserActionSaving}
            >
              {isUserActionSaving
                ? "Saving..."
                : isWatchLater
                  ? "✓ In watch later"
                  : "+ Watch later"}
            </button>
          </div>
        </aside>

        <section className="movie-detail-info">
          <div className="movie-detail-title-area">
            <div className="movie-detail-title-row">
              <div>
                <p className="movie-detail-eyebrow">Movie Detail</p>
                <h1>{movie.title}</h1>
              </div>
            </div>

            <div className="movie-detail-meta">
              <span>{movie.genre}</span>
              <span>{movie.year}</span>
              <span>★ {movie.rating}</span>

              <span
                className={
                  watchStatus === "Watched"
                    ? "movie-detail-watch-pill is-watched"
                    : "movie-detail-watch-pill"
                }
              >
                {watchStatus}
              </span>

              {isWatchLater && (
                <span className="movie-detail-watch-pill is-watch-later">
                  Watch later
                </span>
              )}
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
                  {selectedRating}/10
                  {hasSavedRating && selectedRating === savedRating
                    ? " · Saved"
                    : ""}
                </span>
              )}
            </div>

            <div className="movie-detail-rating-options">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (ratingValue) {
                const isSelected =
                  selectedRating && ratingValue <= selectedRating;

                return (
                  <button
                    key={ratingValue}
                    className={
                      isSelected
                        ? "movie-detail-rating-box is-selected"
                        : "movie-detail-rating-box"
                    }
                    type="button"
                    onClick={function () {
                      onRatingSelect(ratingValue);
                    }}
                    disabled={isUserActionSaving}
                    aria-label={
                      "Rate movie with " + ratingValue + " out of 10"
                    }
                  >
                    <Star
                      size={22}
                      fill={isSelected ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <div className="movie-detail-rating-actions">
              <button
                className="movie-detail-primary-button"
                type="button"
                onClick={onSaveRating}
                disabled={!selectedRating || isUserActionSaving}
              >
                {isUserActionSaving
                  ? "Saving..."
                  : hasSavedRating && selectedRating !== savedRating
                    ? "Update Rating"
                    : hasSavedRating
                      ? "Rating Saved"
                      : "Save Rating"}
              </button>

              {hasSavedRating && (
                <button
                  className="movie-detail-delete-rating-button"
                  type="button"
                  onClick={onDeleteRating}
                  disabled={isUserActionSaving}
                  aria-label="Delete your rating"
                  title="Delete rating"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="movie-detail-divider" />
    </>
  );
}

export default MovieDetailSection;
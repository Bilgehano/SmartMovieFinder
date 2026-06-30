import { Link } from "react-router-dom";
import "./MovieDetailBar.css";

function MovieDetailBar({ movieId, showSectionLinks = true }) {
  return (
    <nav
      className={
        showSectionLinks
          ? "movie-detail-page-bar"
          : "movie-detail-page-bar movie-detail-page-bar-simple"
      }
      aria-label="Movie detail navigation"
    >
      <Link className="movie-detail-page-bar-back" to="/homepage">
        ← Back to homepage
      </Link>

      {showSectionLinks && (
        <>
          <Link
            className="movie-detail-page-bar-graph"
            to={`/movies/${movieId}/graph`}
          >
            Open Graph ↗
          </Link>

          <a
            className="movie-detail-page-bar-ratings"
            href="#community-ratings"
          >
            Ratings
          </a>

          <a
            className="movie-detail-page-bar-recommendations"
            href="#movie-recommendations"
          >
            Recommendations
          </a>
        </>
      )}
    </nav>
  );
}

export default MovieDetailBar;
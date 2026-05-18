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
        <div className="movie-detail-page-bar-links">
          <a href="#community-ratings">Ratings</a>
          <a href="#movie-recommendations">Recommendations</a>
          <Link to={`/movies/${movieId}/graph`}>Open Graph ↗</Link>
        </div>
      )}
    </nav>
  );
}

export default MovieDetailBar;
import { Link } from "react-router-dom";
import "./MovieCard.css";

function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <div className="movie-poster">
        <span>{movie.title.charAt(0)}</span>
      </div>

      <div className="movie-card-body">
        <h3>{movie.title}</h3>

        <p className="movie-card-meta">
          {movie.year} · {movie.genre}
        </p>

        <div className="movie-card-footer">
          <span className="movie-card-rating">★ {movie.rating}</span>

          <Link to={`/movies/${movie.id}`} className="movie-card-link">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
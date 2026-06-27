import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";

import "./MovieCard.css";

function MovieCard({ movie }) {
  const posterLetter = movie.title ? movie.title.charAt(0) : "M";

  return (
    <article className="movie-card">
      <div className="movie-poster">
        <span className="movie-card-rating">
          <Star size={15} fill="currentColor" aria-hidden="true" />
          {movie.rating}
        </span>

        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} />
        ) : (
          <span>{posterLetter}</span>
        )}
      </div>

      <div className="movie-card-body">
        <div className="movie-card-top">
          <div className="movie-card-title-area">
            <h3>{movie.title}</h3>

            <p className="movie-card-meta">
              {movie.year} · {movie.genre}
            </p>
          </div>
        </div>

        <div className="movie-card-footer">
          <Link to={`/movies/${movie.id}`} className="movie-card-link">
            <span>Details</span>
            <ChevronRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default MovieCard;
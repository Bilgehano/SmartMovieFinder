import { Link } from "react-router-dom";
import "./BrowseMovieCard.css";

function getMovieGenreText(movie) {
  if (Array.isArray(movie.genres)) {
    return movie.genres.join(", ");
  }

  return movie.genre || "Unknown genre";
}

function getMovieRating(movie) {
  return movie.rating || movie.averageRating || "N/A";
}

export default function BrowseMovieCard({ movie }) {
  const posterLetter = movie.title ? movie.title.charAt(0).toUpperCase() : "M";

  return (
    <article className="browse-movie-card">
      <div className="browse-movie-poster">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} />
        ) : (
          <span>{posterLetter}</span>
        )}
      </div>

      <div className="browse-movie-info">
        <div>
          <h3>{movie.title}</h3>

          <p>
            {movie.year || "Unknown"} · {getMovieGenreText(movie)}
          </p>
        </div>

        <div className="browse-movie-bottom">
          <span>★ {getMovieRating(movie)}</span>

          <Link to={`/movies/${movie.id}`}>View details</Link>
        </div>
      </div>
    </article>
  );
}
import MovieCard from "../shared/MovieCard";
import "./HomeMovieRow.css";

function HomeMovieRow({
  title,
  movies,
  emptyTitle,
  emptyText,
}) {
  const hasMovies = movies.length > 0;

  return (
    <section className="home-movie-row">
      <div className="home-movie-row-header">
        <h2 className="home-movie-row-title">
          {title}
        </h2>
      </div>

      {hasMovies ? (
        <div className="home-movie-row-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="home-movie-row-empty">
          <p className="home-movie-row-empty-title">
            {emptyTitle}
          </p>

          <p className="home-movie-row-empty-text">
            {emptyText}
          </p>
        </div>
      )}
    </section>
  );
}

export default HomeMovieRow;
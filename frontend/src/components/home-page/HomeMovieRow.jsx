import MovieCard from "../shared/MovieCard";
import "./HomeMovieRow.css";

function HomeMovieRow({ title, movies }) {
  return (
    <section className="home-movie-row">
      <div className="home-movie-row-header">
        <h2 className="home-movie-row-title">
          {title}
        </h2>
      </div>

      <div className="home-movie-row-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

export default HomeMovieRow;
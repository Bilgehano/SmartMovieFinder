import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import "./HomeMovieRow.css";

function HomeMovieRow({ title, linkTo, movies }) {
  return (
    <section className="home-movie-row">
      <div className="home-movie-row-header">
        <Link to={linkTo} className="home-movie-row-title">
          {title}
          <span aria-hidden="true">→</span>
        </Link>
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
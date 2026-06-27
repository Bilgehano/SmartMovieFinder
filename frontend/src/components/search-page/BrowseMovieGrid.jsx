import MovieCard from "../shared/MovieCard";
import "./BrowseMovieGrid.css";

export default function BrowseMovieGrid({ movies }) {
  if (!movies || movies.length === 0) {
    return (
      <section className="browse-empty-state">
        <h2>No movies found</h2>
        <p>Try another search term or change your filters.</p>
      </section>
    );
  }

  return (
    <section className="browse-movie-grid-wrapper">
      <div className="browse-movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
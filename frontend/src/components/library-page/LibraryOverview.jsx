import "./LibraryOverview.css";

function LibraryOverview({
  totalMovies,
  watchedMovies,
  watchlistMovies,
  ratedMovies,
}) {
  return (
    <div className="library-overview">
      <article className="library-overview-card">
        <span>{ratedMovies}</span>
        <p>Rated</p>
      </article>

      <article className="library-overview-card">
        <span>{watchedMovies}</span>
        <p>Watched</p>
      </article>

      <article className="library-overview-card">
        <span>{watchlistMovies}</span>
        <p>Watchlist</p>
      </article>

      <article className="library-overview-card library-overview-card-total">
        <span>{totalMovies}</span>
        <p>Total Movies</p>
      </article>
    </div>
  );
}

export default LibraryOverview;
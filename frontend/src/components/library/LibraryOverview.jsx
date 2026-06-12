import "./LibraryOverview.css";

function LibraryOverview({ totalMovies, watchedMovies, ratedMovies }) {
  return (
    <div className="library-overview">
      <article className="library-overview-card">
        <span>{totalMovies}</span>
        <p>Total Movies</p>
      </article>

      <article className="library-overview-card">
        <span>{watchedMovies}</span>
        <p>Watched</p>
      </article>

      <article className="library-overview-card">
        <span>{ratedMovies}</span>
        <p>Rated</p>
      </article>
    </div>
  );
}

export default LibraryOverview;
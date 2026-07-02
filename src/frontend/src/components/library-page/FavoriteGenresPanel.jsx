import "./FavoriteGenresPanel.css";

function FavoriteGenresPanel({ genres = [] }) {
  return (
    <section className="library-genre-panel">
      <h3>Favorite Genres</h3>

      <p>
        Your selected favorite genres are used to improve
        your personal movie recommendations.
      </p>

      {genres.length === 0 ? (
        <p className="library-genre-empty">
          No favorite genres selected yet.
        </p>
      ) : (
        <div className="library-genre-list">
          {genres.map((genre) => (
            <span
              key={genre}
              className="library-genre-pill"
            >
              {genre}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default FavoriteGenresPanel;
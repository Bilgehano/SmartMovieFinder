import "./FavoriteGenresPanel.css";

function FavoriteGenresPanel({ genres }) {
  return (
    <section className="library-genre-panel">
      <h3>Favorite Genres</h3>

      <p>
        These genres can later be loaded from the user profile or backend.
      </p>

      <div className="library-genre-list">
        {genres.map((genre) => (
          <span key={genre} className="library-genre-pill">
            {genre}
          </span>
        ))}
      </div>
    </section>
  );
}

export default FavoriteGenresPanel;
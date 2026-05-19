import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GenreSelection.css";

function GenreSelection() {
  const navigate = useNavigate();

  const [genres] = useState([
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" }
  ]);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");

    if (!id) {
      navigate("/userlogin");
      return;
    }

    setUserId(id);
  }, [navigate]);

  const toggleGenre = (genreId) => {
    setError("");

    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(
        selectedGenres.filter((id) => id !== genreId)
      );
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedGenres.length < 3) {
      setError("Bitte wähle mindestens 3 Genres aus");
      return;
    }

    if (selectedGenres.length > 5) {
      setError("Du kannst maximal 5 Genres auswählen");
      return;
    }

    setLoading(true);
    setError("");

    try {
      for (const genreId of selectedGenres) {
        await fetch(
          `http://localhost:8080/users/${userId}/favorite-genre/${genreId}`,
          {
            method: "POST"
          }
        );
      }

      localStorage.setItem("isNewUser", "false");

      navigate("/homepage");

    } catch (err) {
      console.error(err);
      setError("Fehler beim Speichern der Genres");

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="GenreSelection">
      <section className="GenreSelection_card">
        <h1>Choose your Favorite Genres</h1>
        <p>Please select three to five genres you like.</p>

        <div className="GenreSelection_grid">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`genre-btn ${
                selectedGenres.includes(genre.id)
                  ? "selected"
                  : ""
              }`}
              disabled={loading}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {error && (
          <p className="error-text">{error}</p>
        )}

        <button
          className="primary-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </button>

        <p className="hint">
          Selected: {selectedGenres.length} / 5
        </p>
      </section>
    </main>
  );
}

export default GenreSelection;
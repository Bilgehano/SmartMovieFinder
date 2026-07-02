import { useEffect, useState } from "react";
import "./UserProfile.css";
import { useNavigate } from "react-router-dom";
import { buildApiUrl } from "../services/apiClient";

import {
  fetchFavoriteGenres,
  fetchWatchedMovies,
  fetchUserRatings,
  fetchWatchLaterMovies,
  deleteUser,
  addFavoriteGenre,
  removeFavoriteGenre
} from "../api/userApi";

function UserProfile() {
  const navigate = useNavigate();

  const [genres, setGenres] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [watchLater, setWatchLater] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [isEditingGenres, setIsEditingGenres] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [saveGenreError, setSaveGenreError] = useState("");
  const [savingGenres, setSavingGenres] = useState(false);

  const availableGenres = [
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
  ];

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    setUsername(localStorage.getItem("username") || "");
    setEmail(localStorage.getItem("email") || "");

    const fetchProfile = async () => {
      try {
        if (!userId) {
          setError("User nicht eingeloggt");
          return;
        }

        const [
          genreData,
          watchedData,
          ratingsData,
          watchLaterData
        ] = await Promise.all([
          fetchFavoriteGenres(userId),
          fetchWatchedMovies(userId),
          fetchUserRatings(userId),
          fetchWatchLaterMovies(userId),
        ]);

        setGenres(genreData || []);
        setWatchedMovies(watchedData || []);
        setRatedMovies(ratingsData || []);
        setWatchLater(watchLaterData || []);

        const selectedIds = availableGenres
          .filter(g => (genreData || []).includes(g.name))
          .map(g => g.id);

        setSelectedGenres(selectedIds);

      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden des Profils");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  /* Account löschen */
  const handleDeleteAccount = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setError("User nicht eingeloggt");
      return;
    }

    const confirmDelete = window.confirm(
      "Bist du sicher, dass du deinen Account löschen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden."
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(userId);

      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("email");

      navigate("/start-page");

    } catch (err) {
      console.error(err);
      setError("Fehler beim Löschen des Accounts");
    }
  };

  const toggleGenre = (genreId) => {
    setSaveGenreError("");

    if (selectedGenres.includes(genreId)) {
      setSelectedGenres(selectedGenres.filter((id) => id !== genreId));
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleSaveGenres = async () => {
    if (selectedGenres.length < 3) {
      setSaveGenreError("Bitte wähle mindestens 3 Genres aus");
      return;
    }

    if (selectedGenres.length > 5) {
      setSaveGenreError("Du kannst maximal 5 Genres auswählen");
      return;
    }

    const userId = localStorage.getItem("userId");

    setSavingGenres(true);
    setSaveGenreError("");

    try {
      // alte Genres löschen
      await Promise.all(
        genres.map(async (genre) => {
          const genreObj = availableGenres.find(g => g.name === genre);
          if (genreObj) {
            await removeFavoriteGenre(userId, genreObj.id);
          }
        })
      );

      // neue Genres speichern
      await Promise.all(
        selectedGenres.map((genreId) =>
          addFavoriteGenre(userId, genreId)
        )
      );

      const updatedGenres = availableGenres
        .filter((genre) => selectedGenres.includes(genre.id))
        .map((genre) => genre.name);

      setGenres(updatedGenres);
      setIsEditingGenres(false);

    } catch (err) {
      console.error(err);
      setSaveGenreError("Fehler beim Speichern der Genres");
    } finally {
      setSavingGenres(false);
    }
  };

  return (
    <main className="UserProfile">

      <section className="profile-card">
        <h1>Profile</h1>

        <div className="profile-info">
          <p><strong>Username:</strong> {username}</p>
          <p><strong>Email:</strong> {email}</p>

          <button className="delete-btn" onClick={handleDeleteAccount}>
            <strong>Account löschen</strong>
          </button>
        </div>
      </section>

      <section className="profile-card">
        <h2>Preferences</h2>
        <p>Your favorite genres:</p>

        {!isEditingGenres ? (
          <>
            <div className="genre-list">
              {genres.length > 0 ? (
                genres.map((genre, index) => (
                  <span key={index} className="genre-badge">
                    {genre}
                  </span>
                ))
              ) : (
                <p>No favorite genres selected</p>
              )}
            </div>

            <button
              className="edit-btn"
              onClick={() => setIsEditingGenres(true)}
            >
              Genres bearbeiten
            </button>
          </>
        ) : (
          <>
            <div className="GenreSelection_grid">
              {availableGenres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`genre-btn ${
                    selectedGenres.includes(genre.id) ? "selected" : ""
                  }`}
                  disabled={savingGenres}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            <p>Ausgewählt: {selectedGenres.length} / 5</p>

            {saveGenreError && (
              <p className="error-text">{saveGenreError}</p>
            )}

            <button
              className="primary-button"
              onClick={handleSaveGenres}
              disabled={savingGenres}
            >
              {savingGenres ? "Speichern..." : "Änderungen speichern"}
            </button>

            <button
              className="secondary-button"
              onClick={() => setIsEditingGenres(false)}
            >
              Abbrechen
            </button>
          </>
        )}
      </section>

      <section className="profile-card">
        <h2>My Stats</h2>

        <div className="stats-grid">
          <div className="stat-box">
            <h3>{watchedMovies.length}</h3>
            <p>Watched Movies</p>
          </div>

          <div className="stat-box">
            <h3>{ratedMovies.length}</h3>
            <p>Rated Movies</p>
          </div>

          <div className="stat-box">
            <h3>{watchLater.length}</h3>
            <p>Watch Later</p>
          </div>
        </div>
      </section>

    </main>
  );
}

export default UserProfile;
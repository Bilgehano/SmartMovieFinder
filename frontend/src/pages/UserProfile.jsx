import { useEffect, useState } from "react";
import "./UserProfile.css";
import { useNavigate } from "react-router-dom";

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

        const genreResponse = await fetch(
          `http://193.197.230.150:8080/users/${userId}/favorite-genres`
        );
        const genreData = await genreResponse.json();

        const watchedResponse = await fetch(
          `http://193.197.230.150:8080/users/${userId}/watched`
        );
        const watchedData = await watchedResponse.json();
  
        const ratingsResponse = await fetch(
          `http://193.197.230.150:8080/users/${userId}/ratings`
        );
        const ratingsData = await ratingsResponse.json();

        const watchLaterResponse = await fetch(
          `http://193.197.230.150:8080/users/${userId}/watch-later`
        );
        const watchLaterData = await watchLaterResponse.json();

        setGenres(genreData || []);
        setWatchedMovies(watchedData || []);
        setRatedMovies(ratingsData || []);
        setWatchLater(watchLaterData || []);

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
    const response = await fetch(
      `http://193.197.230.150:8080/users/${userId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Fehler beim Löschen des Accounts");
    }

    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    navigate("/start-page"); 
  } catch (err) {
    console.error(err);
    setError("Fehler beim Löschen des Accounts");
  }
};

  return (
    <main className="UserProfile">

      <section className="profile-card">

        <h1>Profile</h1>

        <div className="profile-info">
          <p>
            <strong>Username:</strong> {username}
          </p>

          <p>
            <strong>Email:</strong> {email}
          </p>

            <button className="delete-btn" onClick={handleDeleteAccount}>
              <strong>Account löschen</strong>
            </button>
        </div>

      </section>

      <section className="profile-card">

        <h2>Preferences</h2>

        <p>Your favorite genres:</p>

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
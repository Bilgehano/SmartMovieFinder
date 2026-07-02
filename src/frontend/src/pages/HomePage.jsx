import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchUserRatings } from "../api/userApi"

import HomeContentNav from "../components/home-page/HomeContentNav";
import HomeMovieDashboard from "../components/home-page/HomeMovieDashboard";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [ratings, setRatings] = useState([]);
  const [showRatingNotice, setShowRatingNotice] = useState(false);
  const userId = localStorage.getItem("userId");

  function handleSearchSubmit(value) {
    const trimmedSearchTerm = value.trim();

    if (!trimmedSearchTerm) {
      navigate("/search");
      return;
    }

    navigate(
      "/search?query=" + encodeURIComponent(trimmedSearchTerm)
    );
  }

useEffect(() => {
  async function loadRatings() {
    try {
      if (!userId) return;
      const data = await fetchUserRatings(userId);
      setRatings(data || []);

      if (!data || data.length === 0) {
        setShowRatingNotice(true);
      }
    } catch (err) {
      console.error("Failed to load ratings:", err);
    }
  }
  loadRatings();
}, [userId]);

  return (
    <section className="home-page">
      {showRatingNotice && (
      <div className="homeMovieSelection">
        <div className="MovieSelectionNote">
          <p>Wähle deine Liebsten Filme aus, um deine Empfehlungen zu verbessern.</p>

          <div className="MovieSelectionbuttons">
          <button onClick={() => setShowRatingNotice(false)}>
            später
          </button>
          <button onClick={() => navigate("/MovieSelection")}>
            ok
          </button>
          </div>
        </div>
      </div>
      )}
      <section className="home-dashboard-header">
        <div className="home-dashboard-header-content">
          <div className="home-dashboard-intro">
            <h1>Discover Movies</h1>

            <p>
              Explore trending movies, recommended movies, top rated movies
              and your personal movie areas.
            </p>
          </div>

          <HomeContentNav
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
      </section>

      <section className="home-content-shell">
        <div className="home-content-area">
          <HomeMovieDashboard />
        </div>
      </section>
    </section>
  );
}

export default HomePage;
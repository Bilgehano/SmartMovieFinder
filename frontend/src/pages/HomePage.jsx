import { useState } from "react";
import HomeContentNav from "../components/home-page/HomeContentNav";
import HomeMovieDashboard from "../components/home-page/HomeMovieDashboard";
import "./HomePage.css";

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(value) {
    console.log("Search submitted:", value);
  }

  return (
    <section className="home-page">
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
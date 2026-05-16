import { useState } from "react";
import SearchBar from "../components/SearchBar";
import HomeContentNav from "../components/HomeContentNav";
import HomeMovieDashboard from "../components/HomeMovieDashboard";
import "./HomePage.css";

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchSubmit(value) {
    console.log("Search submitted:", value);
  }

  return (
    <section className="home-page">
      <div className="home-search-section">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={handleSearchSubmit}
          placeholder="Search for movies..."
        />
      </div>

      <section className="home-content-shell">
        <HomeContentNav />

        <div className="home-content-area">
          <HomeMovieDashboard />
        </div>
      </section>
    </section>
  );
}

export default HomePage;
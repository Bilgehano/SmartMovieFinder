import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import MovieGraph from "../features/movieGraph/MovieGraph";
import {
  allMovieGraphMockData,
  movieGraphMockData,
} from "../data/mockMovieGraphData";

import "./MovieGraphPage.css";

function findGraphBySearchTerm(searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return null;
  }

  return allMovieGraphMockData.find((graphData) =>
    graphData.center.label.toLowerCase().includes(normalizedSearchTerm)
  );
}

function MovieGraphPage() {
  const { movieId } = useParams();

  const [searchInput, setSearchInput] = useState("");
  
  const [currentGraphData, setCurrentGraphData] = useState(() => {
      const graphFromUrl = allMovieGraphMockData.find(
    (graphData) => String(graphData.center.movieId) === String(movieId)
  );

  return graphFromUrl ?? movieGraphMockData;
 });

  const [graphSearchMessage, setGraphSearchMessage] = useState("");

  function handleGraphSearchSubmit(value) {
    const foundGraphData = findGraphBySearchTerm(value);

    if (!foundGraphData) {
      setGraphSearchMessage(
        "No graph found. Try: Forrest Gump, Inception or The Matrix."
      );
      return;
    }

    setCurrentGraphData(foundGraphData);
    setGraphSearchMessage("");
  }

  const backMovieId = currentGraphData.center.movieId ?? movieId;

  return (
    <main className="movie-graph-page">
      <section className="movie-graph-search-section">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleGraphSearchSubmit}
          placeholder="Search for a movie graph..."
        />
      </section>

      <section className="movie-graph-shell">
        <div className="movie-graph-page-header">
          <div>
            <p className="movie-graph-kicker">Movie Mindmap</p>
            <h1>{currentGraphData.center.label} Graph</h1>
            <p>
              Explore how this movie connects to genres, actors,
              recommendations, similar movies and directors.
            </p>

            {graphSearchMessage && (
              <p className="movie-graph-search-message">
                {graphSearchMessage}
              </p>
            )}
          </div>

          <Link className="movie-graph-back-link" to={`/movies/${backMovieId}`}>
            Open Movie Details
          </Link>
        </div>

        <MovieGraph graphData={currentGraphData} />
      </section>
    </main>
  );
}

export default MovieGraphPage;
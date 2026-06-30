import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./MovieSelection.css";
import SearchBar from "../components/shared/SearchBar";
import MovieCard from "../components/shared/MovieCardSelection";

import { fetchGenres, searchMovies } from "../api/movieApi";
import { createGenreMap, mapTmdbMovieResponse } from "../utils/movieMapper";

function MovieSelection() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [genreMap, setGenreMap] = useState({});

  const [searchResults, setSearchResults] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  const isSelected = (movieId) =>
    favoriteMovies.some((m) => m.id === movieId);

  // Load genres
 
  useEffect(() => {
    async function loadGenres() {
      try {
        const genres = await fetchGenres();
        setGenreMap(createGenreMap(genres));
      } catch (err) {
        console.error(err);
        setError("Could not load genres.");
      }
    }

    loadGenres();
  }, []);

  
  // Search movies

  async function handleSearch(searchTerm) {
    if (!searchTerm.trim()) return;
    if (Object.keys(genreMap).length === 0) return;

    setLoading(true);
    setError("");

    try {
      const response = await searchMovies(searchTerm, 1);

      const mapped = mapTmdbMovieResponse(response, genreMap);
      setSearchResults(mapped.movies);
    } catch (err) {
      console.error(err);
      setError("Could not search movies.");
    } finally {
      setLoading(false);
    }
  }


  // Add movie

  function addFavoriteMovie(movie) {
    if (isSelected(movie.id)) {
      setError("Movie already selected.");
      return;
    }

    if (favoriteMovies.length >= 5) {
      setError("You can select at most 5 movies.");
      return;
    }

    setFavoriteMovies((current) => [...current, movie]);
    setError("");

    // UX: search schließen
    setSearchResults([]);
    setSearchInput("");
  }


  // Remove movie
 
  function removeFavoriteMovie(movieId) {
    setFavoriteMovies((current) =>
      current.filter((m) => m.id !== movieId)
    );
  }

 
  // Save selection

  async function handleSave() {
    if (favoriteMovies.length < 3) {
      setError("Please select at least 3 movies.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await Promise.all(
        favoriteMovies.map((movie) =>
          fetch(`http://localhost:8080/users/${userId}/rate/5`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tmdbId: movie.id,
              title: movie.title,
              posterPath: movie.poster,
              releaseDate: movie.year,
              genre: movie.genre,
            }),
          })
        )
      );

      navigate("/homepage");
    } catch (err) {
      console.error(err);
      setError("Error while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="MovieSelection">
      <section className="MovieSelection_card">
        <h1>Select your favorite movies</h1>

        <p>
          Please choose at least 3 movies you like so we can generate better
          recommendations.
        </p>

        {/* SEARCH */}
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearch}
          placeholder="Search for movies..."
        />

        {loading && <p>Searching...</p>}

        <div className="movie-results">
          {searchResults.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              actionLabel="Add"
              onAction={addFavoriteMovie}
              disabled={isSelected(movie.id)}
            />
          ))}
        </div>

        {/* FAVORITES */}
        <h2>Selected Movies</h2>

        <div className="favorite-movies">
          {favoriteMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              actionLabel="Remove"
              onAction={() => removeFavoriteMovie(movie.id)}
            />
          ))}
        </div>

        <p>
          Selected: {favoriteMovies.length} / 5
        </p>

        {/* ERROR */}
        {error && <p className="error-text">{error}</p>}

        {/* SAVE */}
        <button
          className="primary-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Favorite Movies"}
        </button>
      </section>
    </main>
  );
}

export default MovieSelection;
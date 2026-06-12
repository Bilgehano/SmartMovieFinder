import { useEffect, useState } from "react";
import HomeMovieRow from "./HomeMovieRow";
import {
  popularMovies,
  recentlyViewedMovies,
  recommendedMovies,
  topRatedMovies,
  watchlistMovies,
} from "../data/mockMovies";
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
} from "../api/movieApi";
import "./HomeMovieDashboard.css";

const HOMEPAGE_MOVIE_LIMIT = 4;
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function getYear(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  return String(dateValue).slice(0, 4);
}

function getPosterUrl(posterPath) {
  if (!posterPath) {
    return "";
  }

  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

function getGenreLabel(movie) {
  if (movie.genre) {
    return movie.genre;
  }

  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.map((genre) => genre.name).join(", ");
  }

  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    return "Movie";
  }

  return "Movie";
}

function mapApiMovie(movie) {
  return {
    id: movie.id,
    title: movie.title ?? movie.name ?? "Unknown Movie",
    year: getYear(movie.release_date ?? movie.releaseDate),
    genre: getGenreLabel(movie),
    rating:
      typeof movie.vote_average === "number"
        ? Number(movie.vote_average.toFixed(1))
        : movie.rating ?? "N/A",
    description: movie.overview ?? movie.description ?? "",
    posterUrl: getPosterUrl(movie.poster_path ?? movie.posterPath),
    releaseDate: movie.release_date ?? movie.releaseDate ?? "",
  };
}

function mapApiMovieList(data, limit = HOMEPAGE_MOVIE_LIMIT) {
  const results = Array.isArray(data) ? data : data?.results ?? [];

  return results.slice(0, limit).map(mapApiMovie);
}

function getMoviesFromResult(result, fallbackMovies) {
  if (result.status !== "fulfilled") {
    return fallbackMovies;
  }

  const mappedMovies = mapApiMovieList(result.value);

  if (mappedMovies.length === 0) {
    return fallbackMovies;
  }

  return mappedMovies;
}

function HomeMovieDashboard() {
  const [sections, setSections] = useState({
    trending: recommendedMovies,
    recommended: popularMovies,
    topRated: topRatedMovies,
    recentlyViewed: recentlyViewedMovies,
    watchlist: watchlistMovies,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHomepageMovies() {
      setIsLoading(true);
      setErrorMessage("");

      const [trendingResult, recommendedResult, topRatedResult] =
        await Promise.allSettled([
          fetchTrendingMovies(),
          fetchPopularMovies(2),
          fetchTopRatedMovies(1),
        ]);

      if (!isMounted) {
        return;
      }

      const hasError = [trendingResult, recommendedResult, topRatedResult].some(
        (result) => result.status === "rejected"
      );

      setSections({
        trending: getMoviesFromResult(trendingResult, recommendedMovies),
        recommended: getMoviesFromResult(recommendedResult, popularMovies),
        topRated: getMoviesFromResult(topRatedResult, topRatedMovies),
        recentlyViewed: recentlyViewedMovies,
        watchlist: watchlistMovies,
      });

      if (hasError) {
        setErrorMessage(
          "Some movie sections could not be loaded from the backend. Mock data is shown as fallback."
        );
      }

      setIsLoading(false);
    }

    loadHomepageMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-movie-dashboard">
      <div className="home-movie-dashboard-header">
        <h2>Discover Movies</h2>
        <p>
          Explore trending movies, recommended movies, top rated movies and your
          personal movie areas.
        </p>

        {isLoading && (
          <p className="home-movie-dashboard-status">Loading movies...</p>
        )}

        {errorMessage && (
          <p className="home-movie-dashboard-warning">{errorMessage}</p>
        )}
      </div>

      <HomeMovieRow
        title="Trending Movies"
        linkTo="/search"
        movies={sections.trending}
      />

      <HomeMovieRow
        title="Recommended Movies"
        linkTo="/search"
        movies={sections.recommended}
      />

      <HomeMovieRow
        title="Top Rated"
        linkTo="/search"
        movies={sections.topRated}
      />

      <HomeMovieRow
        title="Recently Viewed"
        linkTo="/library"
        movies={sections.recentlyViewed}
      />

      <HomeMovieRow
        title="Watchlist"
        linkTo="/library"
        movies={sections.watchlist}
      />
    </div>
  );
}

export default HomeMovieDashboard;
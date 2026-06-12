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

import { fetchRecommendedMovies } from "../api/recommendationApi";
import { getCurrentUserId } from "../api/userSession";

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

  if (
    posterPath.startsWith("http://") ||
    posterPath.startsWith("https://")
  ) {
    return posterPath;
  }

  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

function getGenreLabel(movie) {
  if (movie.genre) {
    return movie.genre;
  }

  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres
      .map((genre) => genre.name)
      .filter(Boolean)
      .join(", ");
  }

  return "Movie";
}

function mapApiMovie(movie) {
  const movieId =
    movie.id ??
    movie.tmdbId ??
    movie.movieId;

  return {
    id: movieId,
    tmdbId: movie.tmdbId ?? movie.id ?? movie.movieId,
    title: movie.title ?? movie.name ?? "Unknown Movie",
    year: getYear(
      movie.release_date ??
      movie.releaseDate ??
      movie.first_air_date
    ),
    genre: getGenreLabel(movie),
    rating:
      typeof movie.vote_average === "number"
        ? Number(movie.vote_average.toFixed(1))
        : typeof movie.averageRating === "number"
          ? Number(movie.averageRating.toFixed(1))
          : typeof movie.rating === "number"
            ? Number(movie.rating.toFixed(1))
            : "N/A",
    description:
      movie.overview ??
      movie.description ??
      "",
    posterUrl: getPosterUrl(
      movie.poster_path ??
      movie.posterPath
    ),
    releaseDate:
      movie.release_date ??
      movie.releaseDate ??
      movie.first_air_date ??
      "",
  };
}

function extractMovieList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function mapApiMovieList(
  data,
  limit = HOMEPAGE_MOVIE_LIMIT
) {
  return extractMovieList(data)
    .slice(0, limit)
    .map(mapApiMovie)
    .filter((movie) => movie.id);
}

function getMoviesFromResult(
  result,
  fallbackMovies
) {
  if (result.status !== "fulfilled") {
    return fallbackMovies;
  }

  const mappedMovies = mapApiMovieList(result.value);

  if (mappedMovies.length === 0) {
    return fallbackMovies;
  }

  return mappedMovies;
}

async function fetchRecommendedSection(userId) {
  if (!userId) {
    return fetchPopularMovies(2);
  }

  try {
    const recommendations =
      await fetchRecommendedMovies(
        userId,
        HOMEPAGE_MOVIE_LIMIT
      );

    if (extractMovieList(recommendations).length > 0) {
      return recommendations;
    }
  } catch (error) {
    console.warn(
      "Personalized recommendations could not be loaded:",
      error
    );
  }

  return fetchPopularMovies(2);
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

      const currentUserId = getCurrentUserId();

      const [
        trendingResult,
        recommendedResult,
        topRatedResult,
      ] = await Promise.allSettled([
        fetchTrendingMovies(),
        fetchRecommendedSection(currentUserId),
        fetchTopRatedMovies(1),
      ]);

      if (!isMounted) {
        return;
      }

      const hasError = [
        trendingResult,
        recommendedResult,
        topRatedResult,
      ].some(
        (result) => result.status === "rejected"
      );

      setSections({
        trending: getMoviesFromResult(
          trendingResult,
          recommendedMovies
        ),
        recommended: getMoviesFromResult(
          recommendedResult,
          popularMovies
        ),
        topRated: getMoviesFromResult(
          topRatedResult,
          topRatedMovies
        ),
        recentlyViewed: recentlyViewedMovies,
        watchlist: watchlistMovies,
      });

      if (hasError) {
        setErrorMessage(
          "Some movie sections could not be loaded from the backend. Fallback data is shown."
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
          Explore trending movies, recommended movies, top rated movies and
          your personal movie areas.
        </p>

        {isLoading && (
          <p className="home-movie-dashboard-status">
            Loading movies...
          </p>
        )}

        {errorMessage && (
          <p className="home-movie-dashboard-warning">
            {errorMessage}
          </p>
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
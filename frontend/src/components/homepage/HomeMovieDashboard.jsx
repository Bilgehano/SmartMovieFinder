import { useEffect, useState } from "react";

import HomeMovieRow from "../HomeMovieRow";

import {
  fetchGenres,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
} from "../../api/movieApi";

import { fetchRecommendedMovies } from "../../api/recommendationApi";

import {
  fetchWatchedMovies,
  fetchWatchLaterMovies,
} from "../../api/userApi";

import { getCurrentUserId } from "../../api/userSession";

import { createGenreMap } from "../../utils/movieMapper";
import { mapUserLibraryData } from "../../utils/libraryMapper";

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

  return TMDB_IMAGE_BASE_URL + posterPath;
}

function getGenreLabel(movie) {
  if (movie.genre) {
    return movie.genre;
  }

  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres
      .map(function (genre) {
        return genre.name;
      })
      .filter(Boolean)
      .join(", ");
  }

  return "Movie";
}

function mapApiMovie(movie) {
  const movieId = movie.id ?? movie.tmdbId ?? movie.movieId;

  let rating = "N/A";

  if (typeof movie.vote_average === "number") {
    rating = Number(movie.vote_average.toFixed(1));
  } else if (typeof movie.averageRating === "number") {
    rating = Number(movie.averageRating.toFixed(1));
  } else if (typeof movie.rating === "number") {
    rating = Number(movie.rating.toFixed(1));
  }

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
    rating,
    description: movie.overview ?? movie.description ?? "",
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

function mapApiMovieList(data, limit = HOMEPAGE_MOVIE_LIMIT) {
  return extractMovieList(data)
    .slice(0, limit)
    .map(mapApiMovie)
    .filter(function (movie) {
      return movie.id;
    });
}

function getMoviesFromResult(result) {
  if (result.status !== "fulfilled") {
    return [];
  }

  return mapApiMovieList(result.value);
}

function getSettledValue(result, fallbackValue = []) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  return fallbackValue;
}

async function fetchRecommendedSection(userId) {
  if (!userId) {
    return fetchPopularMovies(2);
  }

  try {
    const recommendations = await fetchRecommendedMovies(
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
    trending: [],
    recommended: [],
    topRated: [],
    recentlyWatched: [],
    watchlist: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHomepageMovies() {
      setIsLoading(true);
      setErrorMessage("");

      const currentUserId = getCurrentUserId();

      const watchedMoviesRequest = currentUserId
        ? fetchWatchedMovies(currentUserId)
        : Promise.resolve([]);

      const watchLaterRequest = currentUserId
        ? fetchWatchLaterMovies(currentUserId)
        : Promise.resolve([]);

      const [
        trendingResult,
        recommendedResult,
        topRatedResult,
        genresResult,
        watchedResult,
        watchLaterResult,
      ] = await Promise.allSettled([
        fetchTrendingMovies(),
        fetchRecommendedSection(currentUserId),
        fetchTopRatedMovies(1),
        fetchGenres(),
        watchedMoviesRequest,
        watchLaterRequest,
      ]);

      if (!isMounted) {
        return;
      }

      const genres = getSettledValue(genresResult);
      const watchedMovies = getSettledValue(watchedResult);
      const watchLaterMovies = getSettledValue(watchLaterResult);

      const genreMap = createGenreMap(genres);

      const personalLibraryMovies = mapUserLibraryData({
        watchedMovies,
        watchLaterMovies,
        ratings: [],
        genreMap,
      });

      const recentlyWatchedMovies = personalLibraryMovies
        .filter(function (movie) {
          return movie.status.includes("watched");
        })
        .slice(0, HOMEPAGE_MOVIE_LIMIT);

      const watchlistMovies = personalLibraryMovies
        .filter(function (movie) {
          return movie.status.includes("watch-later");
        })
        .slice(0, HOMEPAGE_MOVIE_LIMIT);

      setSections({
        trending: getMoviesFromResult(trendingResult),
        recommended: getMoviesFromResult(recommendedResult),
        topRated: getMoviesFromResult(topRatedResult),
        recentlyWatched: recentlyWatchedMovies,
        watchlist: watchlistMovies,
      });

      const relevantResults = currentUserId
        ? [
            trendingResult,
            recommendedResult,
            topRatedResult,
            genresResult,
            watchedResult,
            watchLaterResult,
          ]
        : [
            trendingResult,
            recommendedResult,
            topRatedResult,
          ];

      const hasFailedRequest = relevantResults.some(function (result) {
        return result.status === "rejected";
      });

      if (hasFailedRequest) {
        setErrorMessage(
          "Some movie sections could not be loaded from the backend."
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
      {isLoading && (
        <div className="home-movie-dashboard-message">
          Loading movies...
        </div>
      )}

      {errorMessage && (
        <div className="home-movie-dashboard-message home-movie-dashboard-warning">
          {errorMessage}
        </div>
      )}

      <HomeMovieRow
        title="Trending Movies"
        movies={sections.trending}
      />

      <HomeMovieRow
        title="Recommended Movies"
        movies={sections.recommended}
      />

      <HomeMovieRow
        title="Top Rated"
        movies={sections.topRated}
      />

      <HomeMovieRow
        title="Recently Watched"
        movies={sections.recentlyWatched}
      />

      <HomeMovieRow
        title="Watchlist"
        movies={sections.watchlist}
      />
    </div>
  );
}

export default HomeMovieDashboard;
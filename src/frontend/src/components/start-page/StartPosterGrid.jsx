import { useEffect, useState } from "react";

import { fetchTrendingMovies } from "../../api/movieApi";
import StartPosterCard from "./StartPosterCard";
import "./StartPosterGrid.css";

const CARD_COLUMNS = [
  1,
  2,
  3,
  3,
  3,
  3,
  3,
];

const CARD_LIMIT = CARD_COLUMNS.reduce(function (sum, count) {
  return sum + count;
}, 0);

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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

function getMovieTitle(movie) {
  return movie.title || movie.name || "Movie";
}

function mapStartMovie(movie) {
  return {
    id: movie.id || movie.tmdbId || movie.movieId,
    title: getMovieTitle(movie),
    posterUrl: getPosterUrl(movie.poster_path || movie.posterPath),
  };
}

function extractMovieList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data && data.results)) {
    return data.results;
  }

  return [];
}

function mapTrendingMovies(data) {
  return extractMovieList(data)
    .slice(0, CARD_LIMIT)
    .map(mapStartMovie)
    .filter(function (movie) {
      return movie.id;
    });
}

function getMovieIndex(columnIndex, cardIndex) {
  let index = cardIndex;

  for (let i = 0; i < columnIndex; i += 1) {
    index += CARD_COLUMNS[i];
  }

  return index;
}

function getCardMovie(movies, columnIndex, cardIndex) {
  const movieIndex = getMovieIndex(columnIndex, cardIndex);

  return movies[movieIndex] || null;
}

function StartPosterGrid() {
  const [movies, setMovies] = useState([]);

  useEffect(function () {
    let isMounted = true;

    async function loadTrendingMovies() {
      try {
        const trendingMovies = await fetchTrendingMovies();

        if (!isMounted) {
          return;
        }

        setMovies(mapTrendingMovies(trendingMovies));
      } catch (error) {
        console.warn(
          "Trending movies for start page could not be loaded:",
          error
        );

        if (isMounted) {
          setMovies([]);
        }
      }
    }

    loadTrendingMovies();

    return function cleanup() {
      isMounted = false;
    };
  }, []);

  return (
    <div className="start-poster-grid" aria-hidden="true">
      {CARD_COLUMNS.map(function (cardCount, columnIndex) {
        return (
          <div
            className="start-poster-column"
            key={"start-poster-column-" + columnIndex}
          >
            {Array.from({ length: cardCount }).map(function (_, cardIndex) {
              const movie = getCardMovie(movies, columnIndex, cardIndex);

              return (
                <StartPosterCard
                  key={"start-poster-" + columnIndex + "-" + cardIndex}
                  title={movie ? movie.title : "Bild einfügen"}
                  imageUrl={movie ? movie.posterUrl : ""}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default StartPosterGrid;
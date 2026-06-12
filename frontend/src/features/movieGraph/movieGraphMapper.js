import { graphCategoryConfig } from "./graphCategoryConfig";

const MAX_GRAPH_ITEMS = 5;

export function resolveTmdbIdFromRoute(movieId) {
  return movieId ? String(movieId) : null;
}

function getYearFromReleaseDate(releaseDate) {
  if (!releaseDate) {
    return "Unknown";
  }

  return String(releaseDate).slice(0, 4);
}

function getMovieTitle(movie) {
  return (
    movie?.title ||
    movie?.name ||
    movie?.label ||
    "Unknown Movie"
  );
}

function getMovieId(movie) {
  return (
    movie?.id ??
    movie?.tmdbId ??
    movie?.movieId
  );
}

function getMovieRating(movie) {
  if (typeof movie?.vote_average === "number") {
    return Number(movie.vote_average.toFixed(1));
  }

  if (typeof movie?.averageRating === "number") {
    return Number(movie.averageRating.toFixed(1));
  }

  if (typeof movie?.rating === "number") {
    return Number(movie.rating.toFixed(1));
  }

  return "N/A";
}

function normalizeMovieList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

function mapMoviesToGraphItems(response, currentTmdbId) {
  return normalizeMovieList(response)
    .map((movie) => {
      const movieId = getMovieId(movie);

      if (!movieId) {
        return null;
      }

      return {
        movieId: String(movieId),
        label: getMovieTitle(movie),
        year: getYearFromReleaseDate(
          movie.release_date ||
          movie.releaseDate ||
          movie.first_air_date
        ),
        averageRating: getMovieRating(movie),
      };
    })
    .filter(Boolean)
    .filter(
      (movie) =>
        String(movie.movieId) !== String(currentTmdbId)
    )
    .filter(
      (movie) =>
        movie.movieId &&
        movie.label
    )
    .slice(0, MAX_GRAPH_ITEMS);
}

function buildGraphCategories(categoryItems) {
  return graphCategoryConfig.map((category) => ({
    ...category,
    items: categoryItems[category.id] ?? [],
  }));
}

export function mapBackendDataToMovieGraph({
  movieDetail,
  sameGenreMovies,
  similarMovies,
  recommendations,
  genrePicks,
  topRatedMovies,
}) {
  const tmdbId =
    movieDetail.id ??
    movieDetail.tmdbId;

  const genres = movieDetail.genres ?? [];

  return {
    center: {
      id: `movie-${tmdbId}`,
      movieId: String(tmdbId),
      tmdbId,
      type: "movie",
      label:
        movieDetail.title ??
        movieDetail.name ??
        "Unknown Movie",
      year: getYearFromReleaseDate(
        movieDetail.release_date ??
        movieDetail.releaseDate ??
        movieDetail.first_air_date
      ),
      genre:
        genres.length > 0
          ? genres
              .map((genre) => genre.name)
              .filter(Boolean)
              .join(", ")
          : "Unknown",
      averageRating:
        typeof movieDetail.vote_average === "number"
          ? Number(movieDetail.vote_average.toFixed(1))
          : "N/A",
    },

    categories: buildGraphCategories({
      "same-genre": mapMoviesToGraphItems(
        sameGenreMovies,
        tmdbId
      ),
      "similar-movies": mapMoviesToGraphItems(
        similarMovies,
        tmdbId
      ),
      recommendations: mapMoviesToGraphItems(
        recommendations,
        tmdbId
      ),
      "your-genre-picks": mapMoviesToGraphItems(
        genrePicks,
        tmdbId
      ),
      "top-rated": mapMoviesToGraphItems(
        topRatedMovies,
        tmdbId
      ),
    }),
  };
}

export function getFirstSearchResult(searchResponse) {
  const results = normalizeMovieList(searchResponse);

  return results[0] ?? null;
}

export function getPrimaryGenreId(movieDetail) {
  return (
    movieDetail.genres?.[0]?.id ??
    movieDetail.genre_ids?.[0] ??
    null
  );
}
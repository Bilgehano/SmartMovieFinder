const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function createGenreMap(genres) {
  const genreMap = {};

  genres.forEach((genre) => {
    genreMap[String(genre.id)] = genre.name;
  });

  return genreMap;
}

function getMovieYear(releaseDate) {
  if (!releaseDate) {
    return "Unknown";
  }

  return releaseDate.slice(0, 4);
}

function getMovieGenreText(movie, genreMap) {
  if (!Array.isArray(movie.genre_ids) || movie.genre_ids.length === 0) {
    return "Unknown";
  }

  const genreNames = movie.genre_ids
    .map((genreId) => genreMap[String(genreId)])
    .filter(Boolean);

  if (genreNames.length === 0) {
    return "Unknown";
  }

  return genreNames.join(", ");
}

function getMovieRating(voteAverage) {
  if (typeof voteAverage !== "number") {
    return "N/A";
  }

  return Number(voteAverage.toFixed(1));
}

function getPosterUrl(posterPath) {
  if (!posterPath) {
    return "";
  }

  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

export function mapTmdbMovie(movie, genreMap = {}) {
  return {
    id: movie.id,
    tmdbId: movie.id,
    title: movie.title || movie.name || "Untitled",
    year: getMovieYear(movie.release_date || movie.first_air_date),
    genre: getMovieGenreText(movie, genreMap),
    rating: getMovieRating(movie.vote_average),
    posterUrl: getPosterUrl(movie.poster_path),
    description: movie.overview || "",
  };
}

function getMovieDetailGenreText(movie, genreMap = {}) {
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    const genreNames = movie.genres
      .map((genre) => genre.name)
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  return getMovieGenreText(movie, genreMap);
}

export function mapTmdbMovieDetail(movie, genreMap = {}) {
  return {
    id: movie.id,
    tmdbId: movie.id,
    title: movie.title || movie.name || "Untitled",
    year: getMovieYear(movie.release_date || movie.first_air_date),
    genre: getMovieDetailGenreText(movie, genreMap),
    rating: getMovieRating(movie.vote_average),
    posterUrl: getPosterUrl(movie.poster_path),
    description: movie.overview || "",
    status: "Not watched",
  };
}

export function mapTmdbMovieList(response, genreMap = {}) {
  const results = Array.isArray(response)
    ? response
    : Array.isArray(response?.results)
      ? response.results
      : [];

  return results.map((movie) => mapTmdbMovie(movie, genreMap));
}

export function mapTmdbMovieResponse(response, genreMap = {}) {
  const results = Array.isArray(response.results) ? response.results : [];

  return {
    movies: results.map((movie) => mapTmdbMovie(movie, genreMap)),
    page: response.page || 1,
    totalPages: response.total_pages || null,
    hasNextPage:
      typeof response.page === "number" &&
      typeof response.total_pages === "number"
        ? response.page < response.total_pages
        : results.length > 0,
  };
}
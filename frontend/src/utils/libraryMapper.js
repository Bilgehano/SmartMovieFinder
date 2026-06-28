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

  return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
}

function getYear(releaseDate) {
  if (!releaseDate) {
    return "Unknown";
  }

  return String(releaseDate).slice(0, 4);
}

function getGenreLabel(genreIds, genreMap) {
  if (!genreIds) {
    return "Unknown Genre";
  }

  const normalizedGenreIds = Array.isArray(genreIds)
    ? genreIds
    : String(genreIds)
        .split(",")
        .map((genreId) => genreId.trim())
        .filter(Boolean);

  const genreNames = normalizedGenreIds
    .map((genreId) => genreMap[String(genreId)])
    .filter(Boolean);

  return genreNames.length > 0
    ? genreNames.join(", ")
    : "Unknown Genre";
}

function getLatestDate(...dateValues) {
  const validDates = dateValues
    .filter(Boolean)
    .map((dateValue) => new Date(dateValue))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (validDates.length === 0) {
    return null;
  }

  return validDates
    .sort((firstDate, secondDate) => secondDate - firstDate)[0]
    .toISOString();
}

function createLibraryMovie(movie, genreMap) {
  const tmdbId = movie.tmdbId ?? movie.id;

  return {
    id: tmdbId,
    tmdbId,
    title: movie.title ?? "Unknown Movie",
    year: getYear(movie.releaseDate),
    releaseDate: movie.releaseDate ?? "",
    genre: getGenreLabel(movie.genreIds, genreMap),
    communityRating: "N/A",
    userRating: null,
    posterUrl: getPosterUrl(movie.posterPath),
    description: "",
    status: [],
    addedAt: null,
  };
}

function mergeMovieData(
  movieMap,
  movie,
  status,
  dateValue,
  genreMap
) {
  const tmdbId = movie.tmdbId ?? movie.id;

  if (!tmdbId) {
    return;
  }

  const movieKey = String(tmdbId);

  const currentMovie =
    movieMap.get(movieKey) ??
    createLibraryMovie(movie, genreMap);

  if (!currentMovie.status.includes(status)) {
    currentMovie.status.push(status);
  }

  currentMovie.title =
    movie.title ??
    currentMovie.title;

  currentMovie.releaseDate =
    movie.releaseDate ??
    currentMovie.releaseDate;

  currentMovie.year = getYear(currentMovie.releaseDate);

  if (movie.posterPath) {
    currentMovie.posterUrl = getPosterUrl(movie.posterPath);
  }

  if (movie.genreIds) {
    currentMovie.genre = getGenreLabel(
      movie.genreIds,
      genreMap
    );
  }

  if (status === "rated" && typeof movie.rating === "number") {
    currentMovie.userRating = movie.rating;
  }

  currentMovie.addedAt = getLatestDate(
    currentMovie.addedAt,
    dateValue
  );

  movieMap.set(movieKey, currentMovie);
}

function mergeTmdbDetails(movie, tmdbDetails, genreMap) {
  if (!tmdbDetails) {
    return movie;
  }

  return {
    ...movie,
    title: tmdbDetails.title ?? movie.title,
    year: getYear(
      tmdbDetails.release_date ??
      tmdbDetails.releaseDate ??
      movie.releaseDate
    ),
    releaseDate:
      tmdbDetails.release_date ??
      tmdbDetails.releaseDate ??
      movie.releaseDate,
    genre: getGenreLabel(
      tmdbDetails.genre_ids ??
      tmdbDetails.genreIds ??
      tmdbDetails.genres?.map((genre) => genre.id),
      genreMap
    ),
    rating:
      typeof tmdbDetails.vote_average === "number"
        ? Number(tmdbDetails.vote_average.toFixed(1))
        : movie.rating,
    posterUrl: getPosterUrl(
      tmdbDetails.poster_path ??
      tmdbDetails.posterPath
    ) || movie.posterUrl,
    description:
      tmdbDetails.overview ??
      tmdbDetails.description ??
      movie.description,
  };
}

export function mapUserLibraryData({
  watchedMovies = [],
  watchLaterMovies = [],
  ratings = [],
  genreMap = {},
}) {
  const movieMap = new Map();

  watchLaterMovies.forEach((movie) => {
    mergeMovieData(
      movieMap,
      movie,
      "watch-later",
      movie.addedAt,
      genreMap
    );
  });

  watchedMovies.forEach((movie) => {
    mergeMovieData(
      movieMap,
      movie,
      "watched",
      movie.watchedAt,
      genreMap
    );
  });

  ratings.forEach((movie) => {
    mergeMovieData(
      movieMap,
      movie,
      "rated",
      movie.ratedAt,
      genreMap
    );
  });

  return Array.from(movieMap.values()).sort(
    (firstMovie, secondMovie) =>
      new Date(secondMovie.addedAt || 0) -
      new Date(firstMovie.addedAt || 0)
  );
}

export function enrichLibraryMoviesWithTmdbDetails(
  libraryMovies,
  tmdbDetailsById,
  genreMap
) {
  return libraryMovies.map((movie) =>
    mergeTmdbDetails(
      movie,
      tmdbDetailsById[String(movie.tmdbId)],
      genreMap
    )
  );
}
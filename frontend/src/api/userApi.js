import { requestJson } from "../services/apiClient";

function getMovieTmdbId(movie) {
  return movie.tmdbId ?? movie.id ?? movie.movieId;
}

function getMovieTitle(movie) {
  return movie.title ?? movie.name ?? "Unknown Movie";
}

function getMoviePosterPath(movie) {
  return movie.posterPath ?? movie.poster_path ?? movie.posterUrl ?? "";
}

function getMovieReleaseDate(movie) {
  return movie.releaseDate ?? movie.release_date ?? "";
}

function getMovieGenreIds(movie) {
  if (typeof movie.genreIds === "string") {
    return movie.genreIds;
  }

  if (Array.isArray(movie.genreIds)) {
    return movie.genreIds.join(",");
  }

  if (Array.isArray(movie.genre_ids)) {
    return movie.genre_ids.join(",");
  }

  if (Array.isArray(movie.genres)) {
    return movie.genres
      .map(function (genre) {
        return genre.id ?? genre.genreId;
      })
      .filter(Boolean)
      .join(",");
  }

  return "";
}

function createMoviePayload(movie, includeGenreIds) {
  const tmdbId = getMovieTmdbId(movie);

  if (!tmdbId) {
    throw new Error("Movie is missing tmdbId.");
  }

  const payload = {
    tmdbId: String(tmdbId),
    title: getMovieTitle(movie),
    posterPath: getMoviePosterPath(movie),
    releaseDate: getMovieReleaseDate(movie),
  };

  if (includeGenreIds) {
    payload.genreIds = getMovieGenreIds(movie);
  }

  return payload;
}

function createJsonOptions(method, body) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

export async function fetchWatchLaterMovies(userId) {
  return requestJson("/users/" + userId + "/watch-later");
}

export async function fetchWatchedMovies(userId) {
  return requestJson("/users/" + userId + "/watched");
}

export async function fetchUserRatings(userId) {
  return requestJson("/users/" + userId + "/ratings");
}

export async function fetchFavoriteGenres(userId) {
  return requestJson("/users/" + userId + "/favorite-genres");
}

export async function addWatchedMovie(userId, movie) {
  return requestJson(
    "/users/" + userId + "/watched",
    createJsonOptions("POST", createMoviePayload(movie, true))
  );
}

export async function removeWatchedMovie(userId, tmdbId) {
  return requestJson("/users/" + userId + "/watched/" + tmdbId, {
    method: "DELETE",
  });
}

export async function addWatchLaterMovie(userId, movie) {
  return requestJson(
    "/users/" + userId + "/watch-later",
    createJsonOptions("POST", createMoviePayload(movie, false))
  );
}

export async function removeWatchLaterMovie(userId, tmdbId) {
  return requestJson("/users/" + userId + "/watch-later/" + tmdbId, {
    method: "DELETE",
  });
}

export async function saveMovieRating(userId, movie, rating) {
  return requestJson(
    "/users/" + userId + "/rate/" + rating,
    createJsonOptions("POST", createMoviePayload(movie, true))
  );
}

export async function deleteMovieRating(userId, tmdbId) {
  return requestJson("/users/" + userId + "/rate/" + tmdbId, {
    method: "DELETE",
  });
}

export async function isMovieInWatchLater(userId, tmdbId) {
  return requestJson(
    "/users/" + userId + "/watch-later/" + tmdbId + "/exists"
  );
}
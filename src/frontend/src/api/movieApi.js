import { requestJson } from "../services/apiClient";

export async function fetchGenres() {
  return requestJson(
    "/genres"
  );
}

export async function searchMovies(query, page = 1) {
  const params = new URLSearchParams({
    query,
    page: String(page),
  });

  return requestJson(
    `/movies/search?${params.toString()}`
  );
}

export async function fetchMoviesByGenre(genreId, page = 1) {
  const params = new URLSearchParams({
    page: String(page),
  });

  return requestJson(
    `/movies/genre/${genreId}?${params.toString()}`
  );
}

export async function fetchPopularMovies(page = 1) {
  const params = new URLSearchParams({
    page: String(page),
  });

  return requestJson(
    `/movies/popular?${params.toString()}`
  );
}

export async function fetchTopRatedMovies(page = 1) {
  const params = new URLSearchParams({
    page: String(page),
  });

  return requestJson(
    `/movies/top-rated?${params.toString()}`
  );
}

export async function fetchMovieDetail(tmdbId) {
  return requestJson(
    `/movies/${tmdbId}`
  );
}

export async function fetchSimilarMovies(tmdbId, limit = 5) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return requestJson(
    `/movies/${tmdbId}/similar?${params.toString()}`
  );
}

export async function fetchTrendingMovies() {
  return requestJson(
    "/movies/trending"
  );
}
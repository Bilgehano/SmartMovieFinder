const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function requestJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}: ${text}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("API response was not valid JSON.");
  }
}

export async function fetchGenres() {
  return requestJson("/genres");
}

export async function searchMovies(query, page = 1) {
  const params = new URLSearchParams({
    query,
    page: String(page),
  });

  return requestJson(`/movies/search?${params.toString()}`);
}

export async function fetchMoviesByGenre(genreId, page = 1) {
  return requestJson(`/movies/genre/${genreId}?page=${page}`);
}

export async function fetchPopularMovies(page = 1) {
  return requestJson(`/movies/popular?page=${page}`);
}

export async function fetchTopRatedMovies(page = 1) {
  return requestJson(`/movies/top-rated?page=${page}`);
}

export async function fetchMovieDetail(tmdbId) {
  return requestJson(`/movies/${tmdbId}`);
}
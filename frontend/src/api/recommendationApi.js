import { requestJson } from "./movieApi";

export async function fetchRecommendedMovies(userId, limit = 4) {
  return requestJson(`/recommendations/${userId}?limit=${limit}`);
}

export async function fetchGenreBasedRecommendations(userId, limit = 4) {
  return requestJson(`/recommendations/${userId}/by-genre?limit=${limit}`);
}

export async function fetchTopRatedRecommendations(userId, limit = 4) {
  return requestJson(`/recommendations/${userId}/top-rated?limit=${limit}`);
}
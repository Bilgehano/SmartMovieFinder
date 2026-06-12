import { requestJson } from "../services/apiClient";

export async function fetchRecommendedMovies(userId, limit = 5) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return requestJson(
    `/recommendations/${userId}?${params.toString()}`
  );
}

export async function fetchGenreBasedRecommendations(
  userId,
  limit = 5
) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return requestJson(
    `/recommendations/${userId}/by-genre?${params.toString()}`
  );
}

export async function fetchTopRatedRecommendations(
  userId,
  limit = 5
) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  return requestJson(
    `/recommendations/${userId}/top-rated?${params.toString()}`
  );
}
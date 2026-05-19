import { requestJson } from "./movieApi";

export async function fetchWatchLaterMovies(userId) {
  return requestJson(`/users/${userId}/watch-later`);
}

export async function fetchWatchedMovies(userId) {
  return requestJson(`/users/${userId}/watched`);
}

export async function fetchUserRatings(userId) {
  return requestJson(`/users/${userId}/ratings`);
}

export async function fetchFavoriteGenres(userId) {
  return requestJson(`/users/${userId}/favorite-genres`);
}
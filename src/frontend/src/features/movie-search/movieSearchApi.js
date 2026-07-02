import {
  fetchMoviesByGenre,
  fetchPopularMovies,
  fetchTopRatedMovies,
  searchMovies,
} from "../../api/movieApi";
import { fetchRecommendedMovies } from "../../api/recommendationApi";
import { getCurrentUserId } from "../../api/userSession";

import {
  BACKEND_PAGES_TO_PREFETCH,
  MOVIES_PER_PAGE,
} from "./movieSearchConstants";
import {
  extractMovieList,
  mapMovieResponse,
  removeDuplicateMovies,
} from "./movieSearchHelpers";

async function loadMoviePage({
  searchTerm,
  genreId,
  sourceType,
  page,
}) {
  if (searchTerm) {
    return searchMovies(searchTerm, page);
  }

  if (genreId !== "all") {
    return fetchMoviesByGenre(genreId, page);
  }

  if (sourceType === "top-rated") {
    return fetchTopRatedMovies(page);
  }

  if (sourceType === "recommended") {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      return fetchPopularMovies(page);
    }

    try {
      const recommendations = await fetchRecommendedMovies(
        currentUserId,
        MOVIES_PER_PAGE * 3
      );

      if (extractMovieList(recommendations).length === 0) {
        return fetchPopularMovies(page);
      }

      return recommendations;
    } catch (error) {
      console.warn(
        "Recommended movies could not be loaded:",
        error
      );

      return fetchPopularMovies(page);
    }
  }

  return fetchPopularMovies(page);
}

export async function loadMoviePages({
  searchTerm,
  genreId,
  sourceType,
  genreMap,
  shouldPrefetch,
  currentPage,
}) {
  const pagesToLoad =
    sourceType === "recommended"
      ? 1
      : shouldPrefetch
        ? BACKEND_PAGES_TO_PREFETCH
        : 1;

  const firstPageToLoad = shouldPrefetch ? 1 : currentPage;
  const requests = [];

  for (let index = 0; index < pagesToLoad; index += 1) {
    const page = firstPageToLoad + index;

    requests.push(
      loadMoviePage({
        searchTerm,
        genreId,
        sourceType,
        page,
      })
    );
  }

  const responses = await Promise.all(requests);

  const mappedResponses = responses.map(function (response, index) {
    return mapMovieResponse(
      response,
      genreMap,
      firstPageToLoad + index
    );
  });

  const lastResponse = mappedResponses[mappedResponses.length - 1];

  const movies = shouldPrefetch
    ? removeDuplicateMovies(
        mappedResponses.flatMap(function (response) {
          return response.movies;
        })
      )
    : mappedResponses[0]?.movies || [];

  return {
    movies,
    hasNextBackendPage:
      sourceType === "recommended"
        ? false
        : Boolean(lastResponse?.hasNextPage),
  };
}
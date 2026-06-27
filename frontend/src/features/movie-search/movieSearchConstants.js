export const MOVIES_PER_PAGE = 20;
export const BACKEND_PAGES_TO_PREFETCH = 10;
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const DEFAULT_SOURCE = "popular";

export const MIN_RELEASE_YEAR = 1888;
export const MAX_RELEASE_YEAR = new Date().getFullYear() + 5;

export const DEFAULT_FILTERS = {
  genre: "all",
  yearFrom: "",
  yearTo: "",
  rating: "all",
  sortBy: "relevance",
};

export const SOURCE_SORT_VALUES = [
  "popular",
  "top-rated",
  "new-releases",
  "recommended",
];

export const VALID_SEARCH_SOURCES = [
  "popular",
  "top-rated",
  "new-releases",
  "recommended",
];
import {
  DEFAULT_FILTERS,
  DEFAULT_SOURCE,
  SOURCE_SORT_VALUES,
  TMDB_IMAGE_BASE_URL,
  VALID_SEARCH_SOURCES,
} from "./movieSearchConstants";

export function getSourceFromSortBy(sortBy) {
  if (SOURCE_SORT_VALUES.includes(sortBy)) {
    return sortBy;
  }

  return DEFAULT_SOURCE;
}

export function getValidSearchSource(sourceValue) {
  if (VALID_SEARCH_SOURCES.includes(sourceValue)) {
    return sourceValue;
  }

  return DEFAULT_SOURCE;
}

export function getFiltersFromSearchParams(searchParams) {
  return {
    genre: searchParams.get("genre") || DEFAULT_FILTERS.genre,
    yearFrom: searchParams.get("yearFrom") || DEFAULT_FILTERS.yearFrom,
    yearTo: searchParams.get("yearTo") || DEFAULT_FILTERS.yearTo,
    rating: searchParams.get("rating") || DEFAULT_FILTERS.rating,
    sortBy: searchParams.get("sortBy") || DEFAULT_FILTERS.sortBy,
  };
}

export function buildSearchParams(sourceType, searchTerm, filters) {
  const params = {};

  if (sourceType !== DEFAULT_SOURCE) {
    params.source = sourceType;
  }

  if (searchTerm.trim()) {
    params.query = searchTerm.trim();
  }

  if (filters.genre !== DEFAULT_FILTERS.genre) {
    params.genre = filters.genre;
  }

  if (filters.yearFrom !== DEFAULT_FILTERS.yearFrom) {
    params.yearFrom = filters.yearFrom;
  }

  if (filters.yearTo !== DEFAULT_FILTERS.yearTo) {
    params.yearTo = filters.yearTo;
  }

  if (filters.rating !== DEFAULT_FILTERS.rating) {
    params.rating = filters.rating;
  }

  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.sortBy = filters.sortBy;
  }

  return params;
}

export function getMovieRating(movie) {
  return Number(movie.rating || 0);
}

export function getMovieYear(movie) {
  return Number(movie.year || 0);
}

export function hasExtraFrontendFilters(filters) {
  return (
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.rating !== "all" ||
    filters.sortBy !== "relevance"
  );
}

export function getPosterUrl(posterPath) {
  if (!posterPath) {
    return "";
  }

  if (
    posterPath.startsWith("http://") ||
    posterPath.startsWith("https://")
  ) {
    return posterPath;
  }

  return TMDB_IMAGE_BASE_URL + posterPath;
}

export function getYear(dateValue) {
  if (!dateValue) {
    return "Unknown";
  }

  return String(dateValue).slice(0, 4);
}

export function getGenreLabel(movie, genreMap) {
  if (movie.genre) {
    return movie.genre;
  }

  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres
      .map(function (genre) {
        return genre.name;
      })
      .filter(Boolean)
      .join(", ");
  }

  if (Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0) {
    const genreNames = movie.genre_ids
      .map(function (genreId) {
        return genreMap[String(genreId)];
      })
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  if (Array.isArray(movie.genreIds) && movie.genreIds.length > 0) {
    const genreNames = movie.genreIds
      .map(function (genreId) {
        return genreMap[String(genreId)];
      })
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  if (typeof movie.genreIds === "string" && movie.genreIds.trim()) {
    const genreNames = movie.genreIds
      .split(",")
      .map(function (genreId) {
        return genreId.trim();
      })
      .filter(Boolean)
      .map(function (genreId) {
        return genreMap[String(genreId)];
      })
      .filter(Boolean);

    if (genreNames.length > 0) {
      return genreNames.join(", ");
    }
  }

  return "Movie";
}

export function getMovieRatingValue(movie) {
  if (typeof movie.vote_average === "number") {
    return Number(movie.vote_average.toFixed(1));
  }

  if (typeof movie.averageRating === "number") {
    return Number(movie.averageRating.toFixed(1));
  }

  if (typeof movie.rating === "number") {
    return Number(movie.rating.toFixed(1));
  }

  return "N/A";
}

export function mapApiMovie(movie, genreMap) {
  const movieId =
    movie.id ??
    movie.tmdbId ??
    movie.movieId ??
    movie.tmdb_id;

  return {
    id: movieId,
    tmdbId:
      movie.tmdbId ??
      movie.id ??
      movie.movieId ??
      movie.tmdb_id,
    title: movie.title ?? movie.name ?? "Unknown Movie",
    year: getYear(
      movie.release_date ??
      movie.releaseDate ??
      movie.first_air_date
    ),
    genre: getGenreLabel(movie, genreMap),
    rating: getMovieRatingValue(movie),
    description: movie.overview ?? movie.description ?? "",
    posterUrl: getPosterUrl(
      movie.poster_path ??
      movie.posterPath ??
      movie.posterUrl
    ),
    releaseDate:
      movie.release_date ??
      movie.releaseDate ??
      movie.first_air_date ??
      "",
  };
}

export function extractMovieList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.movies)) {
    return data.movies;
  }

  return [];
}

export function mapMovieResponse(response, genreMap, page) {
  const results = extractMovieList(response);

  const movies = results
    .map(function (movie) {
      return mapApiMovie(movie, genreMap);
    })
    .filter(function (movie) {
      return movie.id;
    });

  const responsePage =
    typeof response?.page === "number" ? response.page : page;

  const hasNextPage =
    typeof response?.page === "number" &&
    typeof response?.total_pages === "number"
      ? response.page < response.total_pages
      : false;

  return {
    movies,
    page: responsePage || 1,
    hasNextPage,
  };
}

export function movieMatchesLocalFilters(movie, filters, genreMap) {
  const movieYear = getMovieYear(movie);
  const movieRating = getMovieRating(movie);

  const selectedGenreName =
    filters.genre === "all" ? "" : genreMap[String(filters.genre)];

  const matchesGenre =
    filters.genre === "all" ||
    String(movie.genre || "").includes(selectedGenreName);

  const matchesYearFrom =
    filters.yearFrom === "" || movieYear >= Number(filters.yearFrom);

  const matchesYearTo =
    filters.yearTo === "" || movieYear <= Number(filters.yearTo);

  const matchesRating =
    filters.rating === "all" || movieRating >= Number(filters.rating);

  return matchesGenre && matchesYearFrom && matchesYearTo && matchesRating;
}

export function sortMovies(movies, sortBy) {
  const sortedMovies = [...movies];

  switch (sortBy) {
    case "top-rated":
      return sortedMovies.sort(
        (a, b) => getMovieRating(b) - getMovieRating(a)
      );

    case "new-releases":
      return sortedMovies.sort(
        (a, b) => getMovieYear(b) - getMovieYear(a)
      );

    case "popular":
    case "recommended":
      return sortedMovies;

    case "rating-desc":
      return sortedMovies.sort(
        (a, b) => getMovieRating(b) - getMovieRating(a)
      );

    case "year-desc":
      return sortedMovies.sort(
        (a, b) => getMovieYear(b) - getMovieYear(a)
      );

    case "year-asc":
      return sortedMovies.sort(
        (a, b) => getMovieYear(a) - getMovieYear(b)
      );

    case "title-asc":
      return sortedMovies.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || ""))
      );

    case "relevance":
    default:
      return sortedMovies;
  }
}

export function removeDuplicateMovies(movies) {
  const uniqueMovies = new Map();

  movies.forEach(function (movie) {
    if (!movie.id) {
      return;
    }

    if (!uniqueMovies.has(movie.id)) {
      uniqueMovies.set(movie.id, movie);
    }
  });

  return Array.from(uniqueMovies.values());
}
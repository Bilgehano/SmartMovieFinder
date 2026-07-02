import {
  MAX_RELEASE_YEAR,
  MIN_RELEASE_YEAR,
} from "./movieSearchConstants";

export function validateYearFilters(filters) {
  const fromYear = filters.yearFrom
    ? Number(filters.yearFrom)
    : null;

  const toYear = filters.yearTo
    ? Number(filters.yearTo)
    : null;

  if (
    fromYear !== null &&
    (fromYear < MIN_RELEASE_YEAR || fromYear > MAX_RELEASE_YEAR)
  ) {
    return `Please enter a start year between ${MIN_RELEASE_YEAR} and ${MAX_RELEASE_YEAR}.`;
  }

  if (
    toYear !== null &&
    (toYear < MIN_RELEASE_YEAR || toYear > MAX_RELEASE_YEAR)
  ) {
    return `Please enter an end year between ${MIN_RELEASE_YEAR} and ${MAX_RELEASE_YEAR}.`;
  }

  if (
    fromYear !== null &&
    toYear !== null &&
    fromYear > toYear
  ) {
    return "The start year must be earlier than or equal to the end year.";
  }

  return "";
}
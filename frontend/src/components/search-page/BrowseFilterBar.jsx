import "./BrowseFilterBar.css";

const MIN_RELEASE_YEAR = 1888;
const MAX_RELEASE_YEAR = new Date().getFullYear() + 5;

export default function BrowseFilterBar({
  filters,
  availableGenres,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  yearValidationMessage,
}) {
  return (
    <section className="browse-filter-section">
      <div className="browse-filter-section-header">
        <span className="browse-filter-eyebrow">Filters</span>

        <button
          type="button"
          className="browse-clear-link"
          onClick={onClearFilters}
        >
          Reset filters
        </button>
      </div>

      <div className="browse-filter-panel">
        <div className="browse-filter-bar">
          <div className="browse-filter-control">
            <label>Genre</label>

            <select
              value={filters.genre}
              onChange={(event) =>
                onFilterChange("genre", event.target.value)
              }
            >
              <option value="all">All genres</option>

              {availableGenres.map((genre) => (
                <option key={genre.id} value={String(genre.id)}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="browse-filter-control browse-year-control">
            <label>Release year</label>

            <div className="browse-year-inputs">
              <input
                type="number"
                min={MIN_RELEASE_YEAR}
                max={MAX_RELEASE_YEAR}
                value={filters.yearFrom}
                onChange={(event) =>
                  onFilterChange("yearFrom", event.target.value)
                }
                placeholder="From"
              />

              <span className="browse-year-separator">–</span>

              <input
                type="number"
                min={MIN_RELEASE_YEAR}
                max={MAX_RELEASE_YEAR}
                value={filters.yearTo}
                onChange={(event) =>
                  onFilterChange("yearTo", event.target.value)
                }
                placeholder="To"
              />
            </div>

            {yearValidationMessage && (
              <p className="browse-year-validation-message">
                {yearValidationMessage}
              </p>
            )}
          </div>

          <div className="browse-filter-control">
            <label>Rating</label>

            <select
              value={filters.rating}
              onChange={(event) =>
                onFilterChange("rating", event.target.value)
              }
            >
              <option value="all">All ratings</option>
              <option value="9">9+</option>
              <option value="8">8+</option>
              <option value="7">7+</option>
              <option value="6">6+</option>
            </select>
          </div>

          <div className="browse-filter-control">
            <label>Sort by</label>

            <select
              value={filters.sortBy}
              onChange={(event) =>
                onFilterChange("sortBy", event.target.value)
              }
            >
              <option value="relevance">Relevance</option>
              <option value="recommended">Recommended</option>
              <option value="popular">Popular Movies</option>
              <option value="top-rated">Top Rated</option>
              <option value="new-releases">New Releases</option>
              <option value="rating-desc">Highest rating</option>
              <option value="year-desc">Newest first</option>
              <option value="year-asc">Oldest first</option>
              <option value="title-asc">Title A-Z</option>
            </select>
          </div>

          <div className="browse-filter-actions">
            <button type="button" onClick={onApplyFilters}>
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
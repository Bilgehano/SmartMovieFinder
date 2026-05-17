import "./BrowseFilterBar.css";

export default function BrowseFilterBar({
  filters,
  availableGenres,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) {
  return (
    <section className="browse-filter-bar">
      <div className="browse-filter-control">
        <label>Genre</label>

        <select
          value={filters.genre}
          onChange={(event) => onFilterChange("genre", event.target.value)}
        >
          <option value="all">All genres</option>

          {availableGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="browse-filter-control browse-year-control">
        <label>Year</label>

        <div className="browse-year-inputs">
          <input
            type="number"
            value={filters.yearFrom}
            onChange={(event) => onFilterChange("yearFrom", event.target.value)}
            placeholder="From"
          />

          <input
            type="number"
            value={filters.yearTo}
            onChange={(event) => onFilterChange("yearTo", event.target.value)}
            placeholder="To"
          />
        </div>
      </div>

      <div className="browse-filter-control">
        <label>Rating</label>

        <select
          value={filters.rating}
          onChange={(event) => onFilterChange("rating", event.target.value)}
        >
          <option value="all">All ratings</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
        </select>
      </div>

      <div className="browse-filter-control">
        <label>Sorted by</label>

        <select
          value={filters.sortBy}
          onChange={(event) => onFilterChange("sortBy", event.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="rating-desc">Highest rating</option>
          <option value="year-desc">Newest first</option>
          <option value="year-asc">Oldest first</option>
          <option value="title-asc">Title A-Z</option>
        </select>
      </div>

      <div className="browse-filter-actions">
        <button type="button" onClick={onApplyFilters}>
          Apply
        </button>

        <button type="button" onClick={onClearFilters}>
          Clear
        </button>
      </div>
    </section>
  );
}
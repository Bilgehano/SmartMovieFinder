import "./SearchBar.css";

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search for movies...",
}) {
  function handleSubmit(event) {
    event.preventDefault();

    if (onSubmit) {
      onSubmit(value);
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <button className="search-icon" type="submit" aria-label="Search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 21L16.65 16.65M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <input
        className="search-input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </form>
  );
}

export default SearchBar;
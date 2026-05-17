import "./BrowsePagination.css";

export default function BrowsePagination({
  currentPage,
  hasNextPage,
  onPageChange,
}) {
  function goToPreviousPage() {
    onPageChange(Math.max(1, currentPage - 1));
  }

  function goToNextPage() {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  }

  return (
    <nav className="browse-pagination" aria-label="Movie search pagination">
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span>Page {currentPage} / ...</span>

      <button type="button" onClick={goToNextPage} disabled={!hasNextPage}>
        Next
      </button>
    </nav>
  );
}
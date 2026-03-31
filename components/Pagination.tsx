import React from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate an array of pages based on totalPages
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter((page) => {
    // Show all pages if total pages are less than or equal to 5
    if (totalPages <= 5) return true;

    // Show active page and two neighbors
    if (
      page === currentPage ||
      page === currentPage + 1 ||
      page === currentPage + 2
    )
      return true;

    // Show first two pages or last two pages with dots in between
    if (
      page === 1 ||
      page === 2 ||
      page === totalPages - 1 ||
      page === totalPages
    )
      return true;

    return false;
  });

  return (
    <div className="flex ml-auto items-center">
      {/* Previous Page Button */}
      {currentPage > 1 && (
        <div
          className="table_nav_items"
          onClick={() => onPageChange(currentPage - 1)}
        >
          <i className="bi bi-chevron-left arrow-icon"></i>
        </div>
      )}

      {/* Page Numbers */}
      {pages.map((page, index, filteredPages) => (
        <React.Fragment key={page}>
          {/* Add dots if there's a gap between the current and the next displayed page */}
          {index > 0 &&
            filteredPages[index] !== filteredPages[index - 1] + 1 && (
              <div key={`dots-${index}`} className="page-dots">
                ...
              </div>
            )}

          <div
            className={`table_nav_items ${
              currentPage === page ? "active" : ""
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </div>
        </React.Fragment>
      ))}

      {/* Next Page Button */}
      {currentPage < totalPages && (
        <div
          className="table_nav_items"
          onClick={() => onPageChange(currentPage + 1)}
        >
          <i className="bi bi-chevron-right arrow-icon"></i>
        </div>
      )}
    </div>
  );
};

export default Pagination;

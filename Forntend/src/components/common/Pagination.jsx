import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange, hasPrev, hasNext }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        disabled={!hasPrev || currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>

      <span className="pagination-info">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        className="pagination-btn"
        disabled={!hasNext || currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;


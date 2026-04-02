import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  hasNextPage,
  hasPreviousPage,
}: PaginationProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
    scrollToTop();
  };

  const handlePrevious = () => {
    onPrevious();
    scrollToTop();
  };

  const handleNext = () => {
    onNext();
    scrollToTop();
  };

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const showPages = 3;

    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    const end = Math.min(totalPages, start + showPages - 1);

    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
      <button
        onClick={handlePrevious}
        disabled={!hasPreviousPage}
        className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-secondary border border-border hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm whitespace-nowrap`}
      >
        <span>←</span>
        <span className="hidden sm:inline">Précédent</span>
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300 border border-border bg-card text-foreground hover:border-primary hover:bg-primary/10 h-10 w-10`}
          >
            1
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-1 sm:px-2 text-muted-foreground">⋯</span>
          )}
        </>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300 border h-10 w-10 ${
            page === currentPage 
              ? "bg-gradient-brand text-white border-primary shadow-md" 
              : "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10"
          }`}
        >
          {page}
        </button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-1 sm:px-2 text-muted-foreground">⋯</span>
          )}
          <button
            onClick={() => handlePageChange(totalPages)}
            className={`flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-300 border border-border bg-card text-foreground hover:border-primary hover:bg-primary/10 h-10 w-10`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={handleNext}
        disabled={!hasNextPage}
        className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-secondary border border-border hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-sm whitespace-nowrap`}
      >
        <span className="hidden sm:inline">Suivant</span>
        <span>→</span>
      </button>
    </div>
  );
}

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

  const baseBtnClass =
    "flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 border border-border hover:border-primary hover:shadow-md h-10 w-10 sm:h-12 sm:w-12";
  const activeBtnClass =
    "bg-gradient-to-r from-primary to-blue-400 text-white border-transparent shadow-lg";
  const inactiveBtnClass = "bg-card text-foreground";

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-6 flex-wrap">
      <button
        onClick={handlePrevious}
        disabled={!hasPreviousPage}
        className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold`}
      >
        <span>←</span>
        <span className="hidden sm:inline ml-2">Précédent</span>
      </button>

      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className={`${baseBtnClass} ${inactiveBtnClass}`}
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
          className={`${baseBtnClass} ${
            page === currentPage ? activeBtnClass : inactiveBtnClass
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
            className={`${baseBtnClass} ${inactiveBtnClass}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={handleNext}
        disabled={!hasNextPage}
        className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl border border-border bg-card text-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold`}
      >
        <span className="hidden sm:inline mr-2">Suivant</span>
        <span>→</span>
      </button>
    </div>
  );
}

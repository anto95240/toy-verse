
import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPrevious: () => void
  onNext: () => void
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  hasNextPage,
  hasPreviousPage
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages = []
    const showPages = 3 // Augmenté pour plus de visibilité
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2))
    const end = Math.min(totalPages, start + showPages - 1)
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center gap-3 mb-6 mt-8">
      {/* Bouton Précédent */}
      <button
        onClick={onPrevious}
        disabled={!hasPreviousPage}
        className="neo-button modern-card px-5 ps-2 py-3 text-sm font-bold text-text-prim border border-border-color rounded-xl hover:border-btn-add hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-color disabled:hover:shadow-none group"
      >
        <span className="group-hover:text-btn-add transition-colors duration-300">← Précédent</span>
      </button>

      {/* Première page si elle n'est pas visible */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="neo-button modern-card w-12 h-12 text-sm font-bold text-text-prim border border-border-color rounded-xl hover:border-btn-add hover:glow-effect transition-all duration-300 group"
          >
            <span className="group-hover:text-btn-add transition-colors duration-300">1</span>
          </button>
          {visiblePages[0] > 2 && (
            <span className="px-2 py-3 text-sm text-text-second">⋯</span>
          )}
        </>
      )}

      {/* Pages visibles */}
      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`neo-button w-12 h-12 text-sm font-bold rounded-xl transition-all duration-300 group ${
            page === currentPage
              ? 'bg-gradient-to-r from-btn-add to-btn-choix text-white border-transparent glow-effect shadow-lg'
              : 'modern-card text-text-prim border border-border-color hover:border-btn-add hover:glow-effect'
          }`}
        >
          <span className={`${
            page === currentPage 
              ? 'text-white' 
              : 'group-hover:text-btn-add transition-colors duration-300'
          }`}>
            {page}
          </span>
        </button>
      ))}

      {/* Dernière page si elle n'est pas visible */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 py-3 text-sm text-text-second">⋯</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="neo-button modern-card w-12 h-12 text-sm font-bold text-text-prim border border-border-color rounded-xl hover:border-btn-add hover:glow-effect transition-all duration-300 group"
          >
            <span className="group-hover:text-btn-add transition-colors duration-300">{totalPages}</span>
          </button>
        </>
      )}

      {/* Bouton Suivant */}
      <button
        onClick={onNext}
        disabled={!hasNextPage}
        className="neo-button modern-card px-5 ps-2 py-3 text-sm font-bold text-text-prim border border-border-color rounded-xl hover:border-btn-add hover:glow-effect transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-color disabled:hover:shadow-none group"
      >
        <span className="group-hover:text-btn-add transition-colors duration-300">Suivant →</span>
      </button>
    </div>
  )
}

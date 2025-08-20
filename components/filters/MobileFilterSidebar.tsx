import React from "react"
import FilterContent from "./FilterContent"
import type { FilterSidebarProps } from "@/types/filters"

interface MobileFilterSidebarProps extends Omit<FilterSidebarProps, 'className' | 'isMobile'> {
  onClose: () => void
}

export default function MobileFilterSidebar({
  categories,
  studios,
  releaseYears,
  filters,
  filterCounts,
  onToggleCategory,
  onToggleStudio,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onReleaseYearChange,
  onResetFilters,
  onClearSearch,
  isSearchActive = false,
  onClose
}: MobileFilterSidebarProps) {
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-80 bg-bg-second z-50 shadow-lg overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">Filtres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Fermer les filtres"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <FilterContent 
            categories={categories}
            studios={studios}
            releaseYears={releaseYears}
            filters={filters}
            filterCounts={filterCounts}
            onToggleCategory={onToggleCategory}
            onToggleStudio={onToggleStudio}
            onNbPiecesChange={onNbPiecesChange}
            onExposedChange={onExposedChange}
            onSoonChange={onSoonChange}
            onReleaseYearChange={onReleaseYearChange}
            onResetFilters={onResetFilters}
            onClearSearch={onClearSearch}
            isSearchActive={isSearchActive}
            isMobile={true}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  )
}
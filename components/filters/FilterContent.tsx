import React from "react"
import CategoryFilter from "./CategoryFilter"
import StudioFilter from "./StudioFilter"
import PiecesRangeFilter from "./PiecesRangeFilter"
import ExposureFilter from "./ExposureFilter"
import SoonFilter from "./SoonFilter"
import SearchResetButton from "./SearchResetButton"
import type { FilterContentProps } from "@/types/filters"

export default function FilterContent({
  categories,
  studios,
  filters,
  filterCounts,
  onToggleCategory,
  onToggleStudio,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onResetFilters,
  onClearSearch,
  isSearchActive = false,
  isMobile = false,
  onClose
}: FilterContentProps) {
  return (
    <>
      <SearchResetButton
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
        isMobile={isMobile}
        onClose={onClose}
      />

      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={onToggleCategory}
        filterCounts={filterCounts.categories}
        onClose={isMobile ? onClose : undefined}
      />

      <StudioFilter
        studios={studios}
        selectedStudios={filters.studios}
        onToggleStudio={onToggleStudio}
        filterCounts={filterCounts.studios}
        onClose={isMobile ? onClose : undefined}
      />

      <PiecesRangeFilter
        selectedRange={filters.nbPiecesRange}
        filterCounts={filterCounts.nbPiecesRanges}
        onRangeChange={onNbPiecesChange}
      />

      <ExposureFilter
        selectedValue={filters.isExposed}
        filterCounts={filterCounts.exposed}
        onValueChange={onExposedChange}
      />

      <SoonFilter
        selectedValue={filters.isSoon}
        filterCounts={filterCounts.soon}
        onValueChange={onSoonChange}
      />

      <button
        onClick={onResetFilters}
        className="w-full px-3 py-2 text-sm bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
      >
        Réinitialiser tous les filtres
      </button>
    </>
  )
}
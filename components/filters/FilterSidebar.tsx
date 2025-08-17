"use client"

import React from "react"
import FilterContent from "./FilterContent"
import MobileFilterSidebar from "./MobileFilterSidebar"
import type { FilterSidebarProps } from "@/types/filters"

export default function FilterSidebar({
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
  className = "",
  isMobile = false,
  onClose
}: FilterSidebarProps) {
  if (isMobile && onClose) {
    return (
      <MobileFilterSidebar
        categories={categories}
        studios={studios}
        filters={filters}
        filterCounts={filterCounts}
        onToggleCategory={onToggleCategory}
        onToggleStudio={onToggleStudio}
        onNbPiecesChange={onNbPiecesChange}
        onExposedChange={onExposedChange}
        onSoonChange={onSoonChange}
        onResetFilters={onResetFilters}
        onClearSearch={onClearSearch}
        isSearchActive={isSearchActive}
        onClose={onClose}
      />
    )
  }

  return (
    <div className={`bg-bg-second p-4 fixed top-24 left-4 rounded-lg shadow-lg z-30 h-fit max-h-[calc(100vh-120px)] overflow-y-auto ${className}`}>
      <h2 className="mb-4 font-bold text-lg">Filtres</h2>
      
      <FilterContent 
        categories={categories}
        studios={studios}
        filters={filters}
        filterCounts={filterCounts}
        onToggleCategory={onToggleCategory}
        onToggleStudio={onToggleStudio}
        onNbPiecesChange={onNbPiecesChange}
        onExposedChange={onExposedChange}
        onSoonChange={onSoonChange}
        onResetFilters={onResetFilters}
        onClearSearch={onClearSearch}
        isSearchActive={isSearchActive}
        isMobile={false}
        onClose={onClose}
      />
    </div>
  )
}
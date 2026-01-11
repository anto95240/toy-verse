"use client";

import React from "react";
import FilterContent from "./FilterContent";
import MobileFilterSidebar from "./MobileFilterSidebar";
import type { FilterSidebarProps } from "@/types/filters";

export default function FilterSidebar({
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
  className = "",
  isMobile = false,
  onClose,
  filteredCount,
}: FilterSidebarProps) {
  if (isMobile && onClose) {
    return (
      <MobileFilterSidebar
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
        onClose={onClose}
        filteredCount={filteredCount}
      />
    );
  }

  return (
    <div
      className={`modern-card fixed top-24 left-4 rounded-2xl p-6 z-30 h-fit max-h-[calc(100vh-120px)] w-80 overflow-y-auto slide-in-right ${className}`}
    >
      <div className="flex items-center mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
        <h2 className="font-bold text-xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
          Filtres Avancés
        </h2>
      </div>

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
        isMobile={false}
        onClose={onClose}
      />
    </div>
  );
}
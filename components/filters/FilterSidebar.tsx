"use client";

import React from "react";
import FilterContent from "./FilterContent";
import MobileFilterSidebar from "./MobileFilterSidebar";
import type { FilterSidebarProps } from "@/types/filters";

export default function FilterSidebar({
  categories,
  subcategories,
  studios,
  locations,
  releaseYears,
  filters,
  filterCounts,
  onToggleCategory,
  onToggleSubcategory,
  onToggleStudio,
  onToggleLocation,
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
  themeName,
}: FilterSidebarProps) {
  const contentProps = {
    categories,
    subcategories,
    studios,
    locations,
    releaseYears,
    filters,
    filterCounts,
    onToggleCategory,
    onToggleSubcategory,
    onToggleStudio,
    onToggleLocation,
    onNbPiecesChange,
    onExposedChange,
    onSoonChange,
    onReleaseYearChange,
    onResetFilters,
    onClearSearch,
    isSearchActive,
    themeName,
  };

  if (isMobile && onClose) {
    return (
      <MobileFilterSidebar
        {...contentProps}
        onClose={onClose}
        filteredCount={filteredCount}
      />
    );
  }

  return (
    <div
      className={`modern-card fixed top-24 left-4 rounded-2xl p-6 z-30 h-fit max-h-[calc(100vh-120px)] w-80 overflow-y-auto shadow-elevation-4 border-border/60 hover:shadow-elevation-4 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center mb-6 gap-3">
        <div className="w-1.5 h-8 rounded-full bg-gradient-brand"></div>
        <h2 className="font-title font-bold text-2xl text-gradient">Filtres</h2>
      </div>

      <FilterContent {...contentProps} isMobile={false} onClose={onClose} />
    </div>
  );
}

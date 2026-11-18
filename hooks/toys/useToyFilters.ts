import { useMemo } from "react";
import { useFilterActions } from "./useFilterActions";
import { useToyList } from "./useToyList";
import { useFilterCounts } from "./useFilterCounts";
import { collectFilterOptions } from "@/utils/toyFacets";
import type { Filters } from "@/types/filters";

/**
 * Charge la collection une fois, puis filtre et compte en mémoire.
 */
export function useToyFilters(
  themeId: string,
  sessionExists: boolean,
  initialFilters?: Filters
) {
  const {
    filters,
    toggleCategory,
    toggleSubcategory,
    toggleStudio,
    toggleLocation,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    handleGiftOccasionChange,
    handleGiftYearChange,
    resetFilters,
  } = useFilterActions(initialFilters);

  const { toys, allToys, setToys, isLoading } = useToyList(
    themeId,
    filters,
    sessionExists
  );

  const { categories, subcategories, studios, locations, releaseYears, giftYears } =
    useMemo(() => collectFilterOptions(allToys), [allToys]);

  const { filterCounts, totalToys } = useFilterCounts(allToys, filters);

  return {
    toys,
    allToys,
    setToys,
    isLoading,
    categories,
    subcategories,
    studios,
    locations,
    releaseYears,
    giftYears,
    filters,
    filterCounts,
    totalToys,
    toggleCategory,
    toggleSubcategory,
    toggleStudio,
    toggleLocation,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    handleGiftOccasionChange,
    handleGiftYearChange,
    resetFilters,
  };
}

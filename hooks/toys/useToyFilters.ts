import { useFilterOptions } from "./useFilterOptions";
import { useToyList } from "./useToyList";
import { useFilterCounts } from "./useFilterCounts";
import { useFilterActions } from "./useFilterActions";
import type { Toy } from "@/types/theme";

/**
 * Main hook orchestrator that combines all filter-related hooks
 * This hook provides the same API as before but uses smaller, specialized hooks internally
 * Benefits: Better testability, clearer separation of concerns, easier maintenance
 */
export function useToyFilters(themeId: string, sessionExists: boolean) {
  // Load filter options (categories, studios, years) with real-time subscriptions
  const { categories, studios, releaseYears } = useFilterOptions(
    themeId,
    sessionExists
  );

  // Manage filter state and actions
  const {
    filters,
    toggleCategory,
    toggleStudio,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    resetFilters,
  } = useFilterActions();

  // Load and filter toys based on current filters
  const { toys, setToys } = useToyList(themeId, filters, sessionExists);

  // Manage filter counts and optimistic updates
  const { filterCounts, totalToys, refreshCounts, updateCountsOptimistically } =
    useFilterCounts(themeId, sessionExists, categories, studios, filters);

  return {
    toys,
    setToys,
    categories,
    studios,
    releaseYears,
    filters,
    filterCounts,
    totalToys,
    toggleCategory,
    toggleStudio,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    resetFilters,
    refreshCounts,
    updateCountsOptimistically,
  };
}

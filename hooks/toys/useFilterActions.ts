import { useState, useCallback } from "react";
import type { Filters } from "@/types/filters";
import { DEFAULT_FILTERS } from "@/utils/themeViewQuery";

export type { Filters };

/**
 * Hook for managing filter state and actions
 * Provides toggle and update functions for all filter types
 */
export function useFilterActions(initial: Filters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<Filters>(initial);

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }, []);

  const toggleStudio = useCallback((studio: string) => {
    setFilters((prev) => ({
      ...prev,
      studios: prev.studios.includes(studio)
        ? prev.studios.filter((s) => s !== studio)
        : [...prev.studios, studio],
    }));
  }, []);

  const toggleSubcategory = useCallback((sub: string) => {
    setFilters((prev) => ({
      ...prev,
      subcategories: prev.subcategories.includes(sub)
        ? prev.subcategories.filter((s) => s !== sub)
        : [...prev.subcategories, sub],
    }));
  }, []);

  const toggleLocation = useCallback((location: string) => {
    setFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  }, []);

  const handleNbPiecesChange = useCallback((range: string) => {
    setFilters((prev) => ({ ...prev, nbPiecesRange: range }));
  }, []);

  const handleExposedChange = useCallback((value: boolean | null) => {
    setFilters((prev) => ({ ...prev, isExposed: value }));
  }, []);

  const handleSoonChange = useCallback((value: boolean | null) => {
    setFilters((prev) => ({ ...prev, isSoon: value }));
  }, []);

  const handleReleaseYearChange = useCallback((year: string) => {
    setFilters((prev) => ({ ...prev, releaseYear: year }));
  }, []);

  const handleGiftOccasionChange = useCallback((occasion: string) => {
    setFilters((prev) => ({ ...prev, giftOccasion: occasion }));
  }, []);

  const handleGiftYearChange = useCallback((year: string) => {
    setFilters((prev) => ({ ...prev, giftYear: year }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
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
  };
}

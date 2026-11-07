import { useState, useCallback } from "react";

export interface Filters {
  categories: string[];
  subcategories: string[];
  studios: string[];
  locations: string[];
  nbPiecesRange: string;
  isExposed: boolean | null;
  isSoon: boolean | null;
  releaseYear: string;
}

const initialFilters: Filters = {
  categories: [],
  subcategories: [],
  studios: [],
  locations: [],
  nbPiecesRange: "",
  isExposed: null,
  isSoon: null,
  releaseYear: "",
};

/**
 * Hook for managing filter state and actions
 * Provides toggle and update functions for all filter types
 */
export function useFilterActions() {
  const [filters, setFilters] = useState<Filters>(initialFilters);

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

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
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
    resetFilters,
  };
}

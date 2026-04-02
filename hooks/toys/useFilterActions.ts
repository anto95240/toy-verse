import { useState, useCallback } from "react";

export interface Filters {
  categories: string[];
  studios: string[];
  nbPiecesRange: string;
  isExposed: boolean | null;
  isSoon: boolean | null;
  releaseYear: string;
}

const initialFilters: Filters = {
  categories: [],
  studios: [],
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
    toggleStudio,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    resetFilters,
  };
}

import { useState, useCallback, useEffect, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { fetchFilterCounts } from "@/utils/filterQueries";
import type { Toy } from "@/types/theme";

interface Filters {
  categories: string[];
  studios: string[];
  nbPiecesRange: string;
  isExposed: boolean | null;
  isSoon: boolean | null;
  releaseYear: string;
}

export interface FilterCounts {
  categories: Record<string, number>;
  studios: Record<string, number>;
  nbPiecesRanges: Record<string, number>;
  exposed: Record<string, number>;
  soon: Record<string, number>;
  releaseYears: Record<string, number>;
  totalToys?: number;
}

/**
 * Hook for managing filter counts and optimistic updates
 * Handles server refreshes and local optimistic updates when toys are added/removed
 */
export function useFilterCounts(
  themeId: string,
  sessionExists: boolean,
  categories: string[],
  studios: string[],
  filters: Filters
) {
  const [filterCounts, setFilterCounts] = useState<FilterCounts>(() => ({
    categories: {},
    studios: {},
    nbPiecesRanges: {},
    exposed: {},
    soon: {},
    releaseYears: {},
    totalToys: 0,
  }));

  const supabase = useMemo(() => getSupabaseClient(), []);

  // Refresh filter counts from server
  const refreshCountsFromServer = useCallback(async () => {
    if (!sessionExists) return;

    try {
      const counts = await fetchFilterCounts(
        supabase as any,
        themeId,
        categories,
        studios,
        filters
      );
      setFilterCounts(counts);
    } catch (error) {
      console.error("Error refreshing filter counts:", error);
    }
  }, [sessionExists, themeId, categories, studios, filters, supabase]);

  // Auto-refresh when dependencies change
  useEffect(() => {
    refreshCountsFromServer();
  }, [refreshCountsFromServer]);

  // Optimistically update counts when a toy is added/removed
  const updateCountsOptimistically = useCallback(
    (oldToy: Toy | null, newToy: Toy) => {
      // Add new categories/studios if they don't exist
      if (newToy.categorie && !categories.includes(newToy.categorie)) {
        // Note: This just logs, the actual state update happens via refreshCountsFromServer
      }
      if (newToy.studio && !studios.includes(newToy.studio)) {
        // Note: This just logs, the actual state update happens via refreshCountsFromServer
      }

      setFilterCounts((prevCounts) => {
        const newCounts: FilterCounts = JSON.parse(JSON.stringify(prevCounts));
        newCounts.totalToys = newCounts.totalToys || 0;

        const getYear = (dateStr: string | null) =>
          dateStr ? new Date(dateStr).getFullYear().toString() : null;

        // Remove counts for old toy
        if (oldToy) {
          if (oldToy.categorie && newCounts.categories[oldToy.categorie])
            newCounts.categories[oldToy.categorie]--;
          if (oldToy.studio && newCounts.studios[oldToy.studio])
            newCounts.studios[oldToy.studio]--;
          const oldYear = getYear(oldToy.release_date?.toString() || null);
          if (oldYear && newCounts.releaseYears[oldYear])
            newCounts.releaseYears[oldYear]--;
          if (oldToy.is_exposed && newCounts.exposed["true"])
            newCounts.exposed["true"]--;
          if (oldToy.is_soon && newCounts.soon["true"]) newCounts.soon["true"]--;
        } else {
          newCounts.totalToys++;
        }

        // Add counts for new toy
        if (newToy.categorie)
          newCounts.categories[newToy.categorie] =
            (newCounts.categories[newToy.categorie] || 0) + 1;
        if (newToy.studio)
          newCounts.studios[newToy.studio] =
            (newCounts.studios[newToy.studio] || 0) + 1;
        const newYear = getYear(newToy.release_date?.toString() || null);
        if (newYear)
          newCounts.releaseYears[newYear] =
            (newCounts.releaseYears[newYear] || 0) + 1;
        if (newToy.is_exposed)
          newCounts.exposed["true"] = (newCounts.exposed["true"] || 0) + 1;
        if (newToy.is_soon)
          newCounts.soon["true"] = (newCounts.soon["true"] || 0) + 1;

        return newCounts;
      });
    },
    [categories, studios]
  );

  return {
    filterCounts,
    totalToys: filterCounts.totalToys || 0,
    refreshCounts: refreshCountsFromServer,
    updateCountsOptimistically,
  };
}

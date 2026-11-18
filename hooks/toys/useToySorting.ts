import { useState, useMemo, useCallback } from "react";
import type { Toy } from "@/types/theme";
import { formatReleaseYear } from "@/lib/themeProfile";
import type { SortCriteria } from "@/utils/themeViewQuery";

export type { SortCriteria };

type SortingInitial = {
  page?: number;
  sort?: SortCriteria;
  perPage?: number;
};

function releaseTime(value: Toy["release_date"]): number {
  const year = formatReleaseYear(value);
  return year ? Number(year) : 0;
}

export function useToySorting(
  toys: Toy[],
  searchResults: (Toy & { theme_name: string })[],
  isSearchActive: boolean,
  themeId: string,
  initial?: SortingInitial
) {
  const [itemsPerPage, setItemsPerPageState] = useState(initial?.perPage ?? 24);
  const [currentPage, setCurrentPage] = useState(initial?.page ?? 1);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(
    initial?.sort ?? "added_desc"
  );

  const setItemsPerPage = useCallback(
    (next: number) => {
      setCurrentPage((page) => {
        const firstIndex = (page - 1) * itemsPerPage;
        return Math.max(1, Math.floor(firstIndex / next) + 1);
      });
      setItemsPerPageState(next);
    },
    [itemsPerPage]
  );

  const displayedToys = useMemo(() => {
    if (!isSearchActive) return toys;
    // ✅ TOUJOURS filtrer par theme_id pour éviter les croisements entre thèmes
    return searchResults.filter((toy) => toy.theme_id === themeId);
  }, [isSearchActive, toys, searchResults, themeId]);

  const sortedToys = useMemo(() => {
    const sorted = [...displayedToys];
    sorted.sort((a, b) => {
      switch (sortCriteria) {
        case "added_desc":
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        case "added_asc":
          return (
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
          );
        case "release_desc": {
          const aYear = releaseTime(a.release_date);
          const bYear = releaseTime(b.release_date);
          if (!aYear) return 1;
          if (!bYear) return -1;
          return bYear - aYear;
        }
        case "release_asc": {
          const aYear = releaseTime(a.release_date);
          const bYear = releaseTime(b.release_date);
          if (!aYear) return 1;
          if (!bYear) return -1;
          return aYear - bYear;
        }
        default:
          return 0;
      }
    });
    return sorted;
  }, [displayedToys, sortCriteria]);

  const paginatedToys = useMemo(() => {
    return sortedToys.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedToys, currentPage, itemsPerPage]);

  const totalItems = sortedToys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  return {
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    sortCriteria,
    setSortCriteria,
    paginatedToys,
    totalItems,
    totalPages,
    resetPage,
    displayedToysCount: displayedToys.length,
  };
}

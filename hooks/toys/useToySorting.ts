import { useState, useMemo, useCallback } from "react";
import type { Toy } from "@/types/theme";

export type SortCriteria =
  | "added_desc"
  | "added_asc"
  | "release_desc"
  | "release_asc";

export function useToySorting(
  toys: Toy[],
  searchResults: (Toy & { theme_name: string })[],
  isSearchActive: boolean,
  themeId: string
) {
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>("added_desc");

  const displayedToys = useMemo(() => {
    if (!isSearchActive) return toys;
    if (searchResults.length === 1) return searchResults;
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
        case "release_desc":
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return (
            new Date(b.release_date).getTime() -
            new Date(a.release_date).getTime()
          );
        case "release_asc":
          if (!a.release_date) return 1;
          if (!b.release_date) return -1;
          return (
            new Date(a.release_date).getTime() -
            new Date(b.release_date).getTime()
          );
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

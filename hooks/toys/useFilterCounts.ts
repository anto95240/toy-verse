import { useMemo } from "react";
import type { Toy } from "@/types/theme";
import type { Filters } from "@/types/filters";
import { computeFacetCounts } from "@/utils/toyFacets";

export type { FilterCounts } from "@/types/filters";

/**
 * Compteurs dérivés de la collection déjà chargée.
 * Plus de requête par catégorie : le changement de filtre reste instantané.
 */
export function useFilterCounts(toys: Toy[], filters: Filters) {
  const filterCounts = useMemo(
    () => computeFacetCounts(toys, filters),
    [toys, filters]
  );

  return {
    filterCounts,
    totalToys: toys.length,
  };
}

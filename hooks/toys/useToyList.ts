import { useState, useEffect, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { applyFiltersToQuery } from "@/utils/filterQueries";
import type { Toy } from "@/types/theme";

interface Filters {
  categories: string[];
  studios: string[];
  nbPiecesRange: string;
  isExposed: boolean | null;
  isSoon: boolean | null;
  releaseYear: string;
}

/**
 * Hook for loading and filtering the toy list
 * Handles sorting by numero and filtering based on current filters
 */
export function useToyList(
  themeId: string,
  filters: Filters,
  sessionExists: boolean
) {
  const [toys, setToys] = useState<Toy[]>([]);
  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    if (!sessionExists) return;

    const loadAndFilterToys = async () => {
      try {
        let query = supabase.from("toys").select("*").eq("theme_id", themeId);
        query = applyFiltersToQuery(query, filters);

        const { data, error } = await query;

        if (error) {
          console.error("❌ Erreur lors du chargement des toys:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          // Ne pas bloquer sur erreur, laisser toys vide
          return;
        }

        // Sort by numero (numerically, with non-numeric at the end)
        const sorted = (data || []).sort((a: any, b: any) => {
          if (!a.numero) return 1;
          if (!b.numero) return -1;
          const numA = parseInt(a.numero.toString(), 10);
          const numB = parseInt(b.numero.toString(), 10);
          return isNaN(numA) || isNaN(numB)
            ? a.numero.localeCompare(b.numero)
            : numA - numB;
        });
        setToys(sorted);
      } catch (err) {
        console.error("💥 Erreur inattendue lors du chargement des toys:", err);
      }
    };

    loadAndFilterToys();
  }, [sessionExists, themeId, filters, supabase]);

  return {
    toys,
    setToys,
  };
}

import { useState, useCallback, useEffect, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Toy } from "@/types/theme";

export type ToyWithTheme = Toy & { theme_name: string };

type SupabaseToyResponse = Toy & { themes: { name: string } | null };

/**
 * Hook for searching toys with debouncing
 * Returns search results and loading state
 */
export function useSearchToys() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToyWithTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const supabase = useMemo(() => getSupabaseClient(), []);

  // Perform actual search against Supabase
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("toys")
          .select("*, themes(name)")
          .or(
            `nom.ilike.%${searchQuery}%,categorie.ilike.%${searchQuery}%,numero.ilike.%${searchQuery}%`
          );

        if (error) {
          console.error("Search error:", error);
          setResults([]);
        } else if (data) {
          const typedData = data as unknown as SupabaseToyResponse[];
          setResults(
            typedData.map((t) => ({
              ...t,
              theme_name: t.themes?.name || "Inconnu",
            }))
          );
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  // Debounce search on query change (150ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setHasSearched(true);
        performSearch(query);
      } else if (query.trim().length === 0) {
        setHasSearched(false);
        setResults([]);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    hasSearched,
  };
}

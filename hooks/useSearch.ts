import { useState, useEffect, useRef, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };

type SupabaseToyResponse = Toy & { themes: { name: string } | null };

export function useSearch(onResults: (results: ToyWithTheme[]) => void) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ToyWithTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const supabase = getSupabaseClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Wrapper stable pour onResults
  const stableOnResults = useCallback(onResults, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        if (!query) stableOnResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("toys")
          .select("*, themes(name)")
          .or(
            `nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`
          )
          .limit(5);

        if (error) {
          console.error("Supabase search error:", error);
          setSuggestions([]);
          setShowDropdown(false);
          return;
        }

        if (data) {
          const typedData = data as unknown as SupabaseToyResponse[];
          setSuggestions(
            typedData.map((t) => ({
              ...t,
              theme_name: t.themes?.name || "Inconnu",
            }))
          );
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    }, 150); // Réduit de 300ms pour meilleure réactivité
    return () => clearTimeout(timer);
  }, [query, supabase, stableOnResults]);

  const selectToy = (toy: ToyWithTheme) => {
    setQuery(toy.nom);
    setShowDropdown(false);
    onResults([toy]);
  };

  const viewAll = async () => {
    setShowDropdown(false);
    setIsLoading(true);
    const { data } = await supabase
      .from("toys")
      .select("*, themes(name)")
      .or(
        `nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`
      );

    if (data) {
      const typedData = data as unknown as SupabaseToyResponse[];
      onResults(
        typedData.map((t) => ({
          ...t,
          theme_name: t.themes?.name || "Inconnu",
        }))
      );
    }
    setIsLoading(false);
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    onResults([]);
    inputRef.current?.focus();
  };

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
    showDropdown,
    setShowDropdown,
    inputRef,
    dropdownRef,
    selectToy,
    viewAll,
    clear,
  };
}

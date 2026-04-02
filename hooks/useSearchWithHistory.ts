import { useState, useEffect, useRef, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };
type SupabaseToyResponse = Toy & { themes: { name: string } | null };

const SEARCH_HISTORY_KEY = "toy-verse-search-history";
const MAX_HISTORY_ITEMS = 10;

interface SearchHistory {
  query: string;
  timestamp: number;
}

export function useSearchWithHistory(onResults: (results: ToyWithTheme[]) => void) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ToyWithTheme[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const supabase = getSupabaseClient();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const historyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Wrapper stable pour onResults
  const stableOnResults = useCallback(onResults, []);

  // ✅ Charger l'historique au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // ✅ Fermer le dropdown quand on clique außer du composant
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

  // ✅ Effectuer la recherche - corrigé pour les recherches consécutives
  useEffect(() => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timer = setTimeout(async () => {
      const trimmedQuery = query.trim();

      // Si query est vide, afficher l'historique
      if (trimmedQuery.length === 0) {
        setSuggestions([]);
        setShowHistory(true);
        setShowDropdown(false);
        stableOnResults([]);
        return;
      }

      // Si query est trop court, ne pas chercher mais montrer historique
      if (trimmedQuery.length < 2) {
        setSuggestions([]);
        setShowHistory(false); // Cache l'historique quand on tape
        setShowDropdown(false);
        return;
      }

      // Créer un nouveau AbortController pour cette requête
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsLoading(true);
      setShowHistory(false); // Cache l'historique pendant la recherche
      try {
        const { data, error } = await supabase
          .from("toys")
          .select("*, themes(name)")
          .or(
            `nom.ilike.%${trimmedQuery}%,categorie.ilike.%${trimmedQuery}%,numero.ilike.%${trimmedQuery}%`
          )
          .limit(5);

        // Si la requête a été annulée, ne pas mettre à jour l'état
        if (signal.aborted) {
          return;
        }

        if (error) {
          console.error("Supabase search error:", error);
          setSuggestions([]);
          setShowDropdown(true); // Toujours ouvrir le dropdown
          return;
        }

        if (data && data.length > 0) {
          const typedData = data as unknown as SupabaseToyResponse[];
          setSuggestions(
            typedData.map((t) => ({
              ...t,
              theme_name: t.themes?.name || "Inconnu",
            }))
          );
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(true); // Ouvrir le dropdown pour montrer "Aucun résultat"
        }
      } catch (err) {
        // Ignorer les erreurs d'annulation
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Search error:", err);
        }
        setSuggestions([]);
        if (!signal.aborted) {
          setShowDropdown(true);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 150); // Réduit de 300ms pour réactivité + rapide

    return () => clearTimeout(timer);
  }, [query, supabase, stableOnResults]);



  // ✅ Ajouter à l'historique (texte de recherche)
  const addToHistory = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    setSearchHistory((prev) => {
      // Supprimer si déjà dans l'historique
      const filtered = prev.filter((item) => item.query !== trimmed);
      // Ajouter au début
      const updated = [{ query: trimmed, timestamp: Date.now() }, ...filtered];
      // Limiter à MAX_HISTORY_ITEMS
      const limited = updated.slice(0, MAX_HISTORY_ITEMS);
      // Sauvegarder dans localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
      } catch (error) {
        console.error("Failed to save search history:", error);
      }
      return limited;
    });
  }, []);

  // ✅ Sélectionner un jouet
  const selectToy = useCallback(
    (toy: ToyWithTheme) => {
      setQuery(toy.nom);
      setShowDropdown(false);
      addToHistory(toy.nom);
      stableOnResults([toy]);
    },
    [addToHistory, stableOnResults]
  );

  // ✅ Voir tous les résultats
  const viewAll = useCallback(async () => {
    if (query.trim().length < 2) return;

    setShowDropdown(false);
    setIsLoading(true);
    addToHistory(query);

    try {
      const { data } = await supabase
        .from("toys")
        .select("*, themes(name)")
        .or(
          `nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`
        );

      if (data) {
        const typedData = data as unknown as SupabaseToyResponse[];
        stableOnResults(
          typedData.map((t) => ({
            ...t,
            theme_name: t.themes?.name || "Inconnu",
          }))
        );
      }
    } catch (error) {
      console.error("View all search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [query, supabase, stableOnResults, addToHistory]);

  // ✅ Supprimer une entrée de l'historique
  const removeFromHistory = useCallback((queryToRemove: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.query !== queryToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
      } catch (error) {
        console.error("Failed to save history after deletion:", error);
      }
      return filtered;
    });
  }, []);

  // ✅ Supprimer tout l'historique
  const clearAllHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, []);

  // ✅ Réinitialiser la recherche
  const clear = useCallback(() => {
    setQuery("");
    setSuggestions([]);
    setShowHistory(false);
    setShowDropdown(false);
    stableOnResults([]);
    // Properly blur input to remove focus state
    inputRef.current?.blur();
  }, [stableOnResults]);

  // ✅ Recherche depuis l'historique
  const searchFromHistory = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery);
      setShowDropdown(true);
      setShowHistory(false);
      addToHistory(historyQuery);
    },
    [addToHistory]
  );

  // ✅ Gérer le focus sur l'input - stable sans dépendances
  const handleFocus = useCallback(() => {
    // Utiliser le ref pour éviter une dépendance à `query`
    const currentQuery = inputRef.current?.value?.trim() || "";
    // Si champ vide, afficher le dropdown (historique ou message vide)
    if (currentQuery.length === 0) {
      setShowHistory(true);
      setShowDropdown(true);
    }
  }, []);

  // ✅ Auto-enregistrer l'historique quand on tape (avec délai)
  useEffect(() => {
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
    }

    const trimmedQuery = query.trim();

    // Seulement si query est valide (>= 2 chars)
    if (trimmedQuery.length >= 2) {
      // Démarrer un timer pour auto-save après 500ms d'inactivité
      historyTimerRef.current = setTimeout(() => {
        setSearchHistory((prev) => {
          // Supprimer si déjà dans l'historique
          const filtered = prev.filter((item) => item.query !== trimmedQuery);
          // Ajouter au début
          const updated = [{ query: trimmedQuery, timestamp: Date.now() }, ...filtered];
          // Limiter à MAX_HISTORY_ITEMS
          const limited = updated.slice(0, MAX_HISTORY_ITEMS);
          // Sauvegarder dans localStorage
          try {
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
          } catch (error) {
            console.error("Failed to save search history:", error);
          }
          return limited;
        });
      }, 500);
    }

    return () => {
      if (historyTimerRef.current) {
        clearTimeout(historyTimerRef.current);
      }
    };
  }, [query]);

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
    showDropdown,
    setShowDropdown,
    showHistory,
    setShowHistory,
    inputRef,
    dropdownRef,
    selectToy,
    viewAll,
    clear,
    searchHistory,
    searchFromHistory,
    handleFocus,
    removeFromHistory,
    clearAllHistory,
  };
}

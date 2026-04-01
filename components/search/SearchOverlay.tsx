"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSearch,
  faSpinner,
  faChevronRight,
  faHashtag,
  faCalendar,
  faHistory,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { createSlug } from "@/utils/slugUtils";
import { getSupabaseClient } from "@/lib/supabase/client";
import SearchSuggestionImage from "./SearchSuggestionImage";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };
type SupabaseToyResponse = Toy & { themes: { name: string } | null };

interface SearchHistory {
  query: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = "toy-verse-search-history";
const MAX_HISTORY_ITEMS = 10;

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToyWithTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();

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

  // ✅ Quand le modal se ferme, reset le focus
  useEffect(() => {
    if (!isOpen) {
      inputRef.current?.blur();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Effectuer la recherche
  const performSearch = useCallback(async (searchQuery: string) => {
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
  }, [supabase]);

  // Quand le query change, on recherche après 150ms de délai
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

  // ✅ Ajouter à l'historique
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

  // ✅ Recherche depuis l'historique
  const searchFromHistory = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    setHasSearched(true);
    addToHistory(historyQuery);
  }, [addToHistory]);

  // ✅ Réinitialiser et fermer le modal
  const handleClose = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setIsLoading(false);
    inputRef.current?.blur();
    onClose();
  };

  // Naviguer vers un jouet
  const handleSelectToy = (toy: ToyWithTheme) => {
    const themeSlug = createSlug(toy.theme_name);
    const toyId = toy.id;

    // Ajouter à l'historique
    addToHistory(toy.nom);

    // Réinitialiser complètement la recherche
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setIsLoading(false);
    inputRef.current?.blur();

    // Fermer le modal et naviguer
    onClose();
    router.push(`/${themeSlug}?selectedToyId=${toyId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-in fade-in duration-200 p-4 safe-top flex flex-col">
      <div className="flex justify-end pt-4 mb-8">
        <button
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
          aria-label="Fermer"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
      </div>

      <div className="flex flex-col gap-6 mt-6 w-full max-w-lg mx-auto flex-1 overflow-hidden">
        <h2 className="text-3xl font-bold text-center font-title">
          Que cherchez-vous ?
        </h2>

        {/* Input */}
        <div className="relative flex items-center bg-card border-2 border-border rounded-xl focus-within:border-primary transition-all">
          <div className={`pl-4 ${isLoading ? "text-primary animate-spin" : "text-muted-foreground"}`}>
            <FontAwesomeIcon icon={isLoading ? faSpinner : faSearch} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lego Star Wars..."
            className="w-full bg-transparent py-4 px-3 text-lg text-center focus:outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-card border border-border rounded-xl p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <FontAwesomeIcon icon={faSpinner} className="text-2xl text-primary animate-spin" />
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-muted-foreground py-1 sticky top-0 -mt-4 -mx-4 px-4 mb-3 bg-card/80 backdrop-blur-sm">
                  {results.length} résultat{results.length > 1 ? 's' : ''}
                </div>
                {results.map((toy) => (
                  <div
                    key={toy.id}
                    onClick={() => handleSelectToy(toy)}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 cursor-pointer transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                      <SearchSuggestionImage toy={toy} />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {toy.nom}
                      </h4>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        📦 {toy.theme_name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap">
                        {toy.numero && (
                          <span className="bg-secondary px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                            <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                            {toy.numero}
                          </span>
                        )}
                        {toy.release_date && (
                          <span className="bg-secondary px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                            {new Date(toy.release_date).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-xs text-muted-foreground/30 group-hover:text-primary/70 flex-shrink-0 transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : query.trim().length >= 2 ? (
              <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                <FontAwesomeIcon icon={faSearch} className="text-3xl mb-2 opacity-30" />
                <p className="text-sm">Aucun résultat trouvé</p>
              </div>
            ) : null}
          </div>
        )}

        {/* History */}
        {!hasSearched && query.trim().length === 0 && (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-card border border-border rounded-xl p-4">
            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3 px-2 py-1">
                  <div className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faHistory} className="text-xs" />
                    Recherches récentes ({searchHistory.length})
                  </div>
                  <button
                    onClick={clearAllHistory}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                    title="Supprimer tout l'historique"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                </div>
                {searchHistory.map((item, index) => (
                  <div
                    key={`${item.query}-${index}`}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 bg-secondary/20"
                  >
                    <FontAwesomeIcon
                      icon={faHistory}
                      className="text-xs text-muted-foreground/50 group-hover:text-primary/70 flex-shrink-0"
                    />
                    <span
                      onClick={() => searchFromHistory(item.query)}
                      className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {item.query}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.query);
                      }}
                      className="px-2 py-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                      title="Supprimer cette entrée"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                <FontAwesomeIcon icon={faHistory} className="text-3xl mb-2 opacity-30" />
                <p className="text-sm">Aucune recherche récente</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { createSlug } from "@/utils/slugUtils";
import { useSearchToys, type ToyWithTheme } from "@/hooks/useSearchToys";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { SearchResultsList } from "./SearchResultsList";
import { SearchHistorySection } from "./SearchHistorySection";

/**
 * SearchOverlay Component
 * Modal for searching toys with history management
 * Orchestrates search hooks and result/history components
 */
export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Search logic
  const { query, setQuery, results, isLoading, hasSearched } = useSearchToys();

  // History management
  const { searchHistory, addToHistory, removeFromHistory, clearAllHistory } =
    useSearchHistory();

  // Blur input when modal closes
  useEffect(() => {
    if (!isOpen) {
      inputRef.current?.blur();
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close modal and reset state
  const handleClose = useCallback(() => {
    setQuery("");
    inputRef.current?.blur();
    onClose();
  }, [setQuery, onClose]);

  // Handle toy selection - navigate and update history
  const handleSelectToy = useCallback(
    (toy: ToyWithTheme) => {
      const themeSlug = createSlug(toy.theme_name);
      const toyId = toy.id;

      // Add to search history
      addToHistory(toy.nom);

      // Navigate
      router.push(`/${themeSlug}?selectedToyId=${toyId}`);

      // Close overlay
      handleClose();
    },
    [addToHistory, router, handleClose]
  );

  // Handle history selection
  const handleSelectHistory = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery);
      addToHistory(historyQuery);
    },
    [setQuery, addToHistory]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm animate-in fade-in duration-200 p-4 safe-top flex flex-col">
      {/* Close button */}
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

        {/* Search Input */}
        <div className="relative flex items-center bg-card border-2 border-border rounded-xl focus-within:border-primary transition-all">
          <div
            className={`pl-4 ${
              isLoading
                ? "text-primary animate-spin"
                : "text-muted-foreground"
            }`}
          >
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

        {/* Results or History */}
        {hasSearched ? (
          <SearchResultsList
            isLoading={isLoading}
            results={results}
            query={query}
            onSelectToy={handleSelectToy}
          />
        ) : query.trim().length === 0 ? (
          <SearchHistorySection
            history={searchHistory}
            onSelectHistory={handleSelectHistory}
            onRemoveHistory={removeFromHistory}
            onClearAll={clearAllHistory}
          />
        ) : null}
      </div>
    </div>
  );
}

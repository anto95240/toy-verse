"use client";

import { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { useSearchWithHistory } from "@/hooks/useSearchWithHistory";
import { createSlug } from "@/utils/slugUtils";
import { SearchBarDropdown } from "./SearchBarDropdown";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };

/**
 * SearchBar Component
 * Reusable search input with dropdown results and history
 * Uses separated SearchBarDropdown component for cleaner structure
 */
export default function SearchBar({
  onResults,
  placeholder = "Rechercher...",
  className = "",
}: {
  onResults?: (r: ToyWithTheme[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleSearchResults = useCallback(
    (results: ToyWithTheme[]) => {
      if (onResults) onResults(results);
    },
    [onResults]
  );

  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    showDropdown,
    setShowDropdown,
    showHistory,
    inputRef,
    dropdownRef,
    viewAll,
    clear,
    searchHistory,
    searchFromHistory,
    handleFocus,
    removeFromHistory,
    clearAllHistory,
  } = useSearchWithHistory(handleSearchResults);

  // Navigate to selected toy
  const handleSelectToy = useCallback(
    (toy: ToyWithTheme) => {
      const themeSlug = createSlug(toy.theme_name);
      const toyId = toy.id;

      setShowDropdown(false);
      clear();

      router.push(`/${themeSlug}?selectedToyId=${toyId}`);
    },
    [setShowDropdown, clear, router]
  );

  return (
    <div className={`relative w-full ${className} z-50`}>
      {/* Search Input */}
      <div
        className={`relative flex items-center w-full bg-card border-1.5 rounded-xl transition-all duration-300 shadow-sm ${
          showDropdown
            ? "border-primary shadow-elevation-2 ring-2 ring-primary/20"
            : "border-border/60 hover:border-primary/50 hover:shadow-md"
        }`}
      >
        <div
          className={`pl-4 transition-colors duration-300 ${
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
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none font-text"
        />
        {query && (
          <button
            onClick={clear}
            aria-label="réinitialiser la recherche"
            className="pr-4 text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <SearchBarDropdown
          suggestions={suggestions}
          query={query}
          isLoading={isLoading}
          showHistory={showHistory}
          searchHistory={searchHistory}
          dropdownRef={dropdownRef}
          onSelectToy={handleSelectToy}
          onViewAll={viewAll}
          onSelectHistory={searchFromHistory}
          onRemoveHistory={removeFromHistory}
          onClearAll={clearAllHistory}
        />
      )}
    </div>
  );
}

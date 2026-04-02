"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronRight,
  faHashtag,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import SearchSuggestionImage from "./SearchSuggestionImage";
import { SearchHistorySection } from "./SearchHistorySection";
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };

interface SearchBarDropdownProps {
  suggestions: ToyWithTheme[];
  query: string;
  isLoading: boolean;
  showHistory: boolean;
  searchHistory: Array<{ query: string; timestamp: number }>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onSelectToy: (toy: ToyWithTheme) => void;
  onViewAll: () => void;
  onSelectHistory: (query: string) => void;
  onRemoveHistory: (query: string) => void;
  onClearAll: () => void;
}

/**
 * Dropdown component for SearchBar
 * Shows either search results, search history, or empty states
 */
export function SearchBarDropdown({
  suggestions,
  query,
  isLoading,
  showHistory,
  searchHistory,
  dropdownRef,
  onSelectToy,
  onViewAll,
  onSelectHistory,
  onRemoveHistory,
  onClearAll,
}: SearchBarDropdownProps) {
  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 w-full mt-3 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 z-50"
    >
      {/* Search Results */}
      {suggestions.length > 0 ? (
        <>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-sm opacity-70" />
              {suggestions.length} Résultat{suggestions.length > 1 ? "s" : ""}
            </p>
          </div>

          {/* Results Items */}
          <div className="divide-y divide-border/30 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {suggestions.map((toy) => (
              <div
                key={toy.id}
                onClick={() => onSelectToy(toy)}
                className="group flex items-center gap-3 p-3.5 hover:bg-primary/8 cursor-pointer transition-all duration-200 active:bg-primary/12"
              >
                {/* Image */}
                <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-secondary border border-border/50 group-hover:border-primary/30 transition-colors">
                  <SearchSuggestionImage toy={toy} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {toy.nom}
                  </h4>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 flex-wrap">
                    {toy.numero && (
                      <span className="bg-secondary/60 hover:bg-primary/20 px-2 py-1 rounded-md font-mono font-bold flex items-center gap-1 transition-colors">
                        <FontAwesomeIcon icon={faHashtag} className="text-xs opacity-70" />
                        {toy.numero}
                      </span>
                    )}
                    {toy.release_date && (
                      <span className="bg-secondary/60 hover:bg-orange-500/20 px-2 py-1 rounded-md flex items-center gap-1 transition-colors">
                        <FontAwesomeIcon icon={faCalendar} className="text-xs opacity-70" />
                        {new Date(toy.release_date).getFullYear()}
                      </span>
                    )}
                  </div>

                  {/* Theme */}
                  <div className="text-xs text-muted-foreground/60 mt-1.5 truncate">
                    {toy.theme_name}
                  </div>
                </div>

                {/* Arrow */}
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-sm text-muted-foreground/20 group-hover:text-primary/50 flex-shrink-0 transition-all duration-200 group-hover:translate-x-1"
                />
              </div>
            ))}
          </div>

          {/* View All Footer */}
          <button
            onClick={onViewAll}
            className="w-full p-3.5 bg-gradient-to-r from-primary/15 to-secondary/10 hover:from-primary/25 hover:to-secondary/15 text-primary text-sm font-bold flex items-center justify-center gap-2 border-t border-border/50 transition-all duration-200 active:from-primary/35"
          >
            <FontAwesomeIcon icon={faSearch} className="text-base" />
            Voir tous les résultats
          </button>
        </>
      ) : showHistory && query.trim().length === 0 && searchHistory.length > 0 ? (
        // History section via SearchHistorySection component
        <div className="p-4">
          <SearchHistorySection
            history={searchHistory}
            onSelectHistory={onSelectHistory}
            onRemoveHistory={onRemoveHistory}
            onClearAll={onClearAll}
          />
        </div>
      ) : isLoading ? (
        // Loading state
        <div className="px-4 py-8 flex flex-col items-center justify-center text-muted-foreground">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Recherche en cours...</p>
        </div>
      ) : (
        // Empty state
        <div className="px-4 py-8 flex flex-col items-center justify-center text-muted-foreground/60">
          <FontAwesomeIcon icon={faSearch} className="text-3xl mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {query.trim().length === 0
              ? "Tapez pour rechercher"
              : "Aucun résultat trouvé"}
          </p>
        </div>
      )}
    </div>
  );
}

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
import type { Toy } from "@/types/theme";

type ToyWithTheme = Toy & { theme_name: string };

interface SearchBarDropdownProps {
  suggestions: ToyWithTheme[];
  query: string;
  isLoading: boolean;
  showHistory: boolean;
  searchHistory: Array<{ query: string; timestamp: number }>;
  dropdownRef: React.RefObject<HTMLDivElement>;
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
      className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
    >
      {/* Search Results */}
      {suggestions.length > 0 ? (
        <>
          <div className="px-4 py-2 bg-secondary/30 text-[10px] font-bold uppercase text-muted-foreground">
            Résultats ({suggestions.length}) - Cliquez pour voir le jouet
          </div>
          <div className="divide-y divide-border/50 max-h-[70vh] overflow-y-auto">
            {suggestions.map((toy) => (
              <div
                key={toy.id}
                onClick={() => onSelectToy(toy)}
                className="group flex items-center gap-3 p-3 hover:bg-primary/10 cursor-pointer transition-all duration-200"
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                  <SearchSuggestionImage toy={toy} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {toy.nom}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap">
                    {toy.numero && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                        <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                        {toy.numero}
                      </span>
                    )}
                    {toy.release_date && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                        {new Date(toy.release_date).getFullYear()}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground/70 mt-1 truncate">
                    📦 {toy.theme_name}
                  </div>
                </div>

                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-xs text-muted-foreground/30 group-hover:text-primary/70 flex-shrink-0 transition-colors"
                />
              </div>
            ))}
          </div>

          <button
            onClick={onViewAll}
            className="w-full p-3 bg-secondary/50 hover:bg-primary/20 text-primary text-sm font-medium flex items-center justify-center gap-2 border-t border-border transition-colors"
          >
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
            Voir tous les résultats pour &quot;{query}&quot;
          </button>
        </>
      ) : showHistory && query.trim().length === 0 && searchHistory.length > 0 ? (
        // History section
        <>
          <div className="px-4 py-2 bg-secondary/30 text-[10px] font-bold uppercase text-muted-foreground flex items-center justify-between">
            <span>
              <FontAwesomeIcon icon={faSearch} className="mr-2" />
              Recherches récentes ({searchHistory.length})
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
              title="Supprimer tout l'historique"
            >
              ✕
            </button>
          </div>
          <div className="divide-y divide-border/50 max-h-[70vh] overflow-y-auto">
            {searchHistory.map((item, index) => (
              <div
                key={`${item.query}-${index}`}
                className="group flex items-center gap-3 p-3 hover:bg-primary/10 transition-all duration-200"
              >
                <span className="text-xs text-muted-foreground/50">🕐</span>
                <span
                  onClick={() => onSelectHistory(item.query)}
                  className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer"
                >
                  {item.query}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistory(item.query);
                  }}
                  className="text-xs text-muted-foreground/50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer cette entrée"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      ) : showHistory && query.trim().length === 0 && searchHistory.length === 0 ? (
        // Empty history message
        <div className="px-4 py-8 text-center">
          <span className="text-4xl text-muted-foreground/30 mb-2 block">🕐</span>
          <p className="text-sm text-muted-foreground">Aucune recherche récente</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Tapez au moins 2 caractères pour chercher
          </p>
        </div>
      ) : query.trim().length >= 2 && suggestions.length === 0 && !isLoading ? (
        // No results message
        <div className="px-4 py-8 text-center">
          <span className="text-4xl text-muted-foreground/30 mb-2 block">🔍</span>
          <p className="text-sm text-muted-foreground">
            Aucun résultat trouvé pour &quot;{query}&quot;
          </p>
        </div>
      ) : null}
    </div>
  );
}

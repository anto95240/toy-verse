"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSpinner,
  faChevronRight,
  faHashtag,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import SearchSuggestionImage from "./SearchSuggestionImage";
import type { ToyWithTheme } from "@/hooks/useSearchToys";

interface SearchResultsListProps {
  isLoading: boolean;
  results: ToyWithTheme[];
  query: string;
  onSelectToy: (toy: ToyWithTheme) => void;
}

/**
 * Component for displaying search results
 * Shows loading state, found results, or empty state
 */
export function SearchResultsList({
  isLoading,
  results,
  query,
  onSelectToy,
}: SearchResultsListProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-card border border-border rounded-xl p-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-20">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-2xl text-primary animate-spin"
          />
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase text-muted-foreground py-1 sticky top-0 -mt-4 -mx-4 px-4 mb-3 bg-card/80 backdrop-blur-sm">
            {results.length} résultat{results.length > 1 ? "s" : ""}
          </div>
          {results.map((toy) => (
            <div
              key={toy.id}
              onClick={() => onSelectToy(toy)}
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 cursor-pointer transition-all duration-200"
            >
              {/* Image */}
              <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-secondary">
                <SearchSuggestionImage toy={toy} />
              </div>

              {/* Info */}
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
  );
}

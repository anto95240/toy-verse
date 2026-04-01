"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { SearchHistory } from "@/hooks/useSearchHistory";

interface SearchHistorySectionProps {
  history: SearchHistory[];
  onSelectHistory: (query: string) => void;
  onRemoveHistory: (query: string) => void;
  onClearAll: () => void;
}

/**
 * Component for displaying search history
 * Shows recent searches with ability to reuse or delete them
 */
export function SearchHistorySection({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearAll,
}: SearchHistorySectionProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
        <FontAwesomeIcon icon={faHistory} className="text-3xl mb-2 opacity-30" />
        <p className="text-sm">Aucune recherche récente</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-card border border-border rounded-xl p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3 px-2 py-1">
          <div className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-xs" />
            Recherches récentes ({history.length})
          </div>
          <button
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
            title="Supprimer tout l'historique"
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </button>
        </div>
        {history.map((item, index) => (
          <div
            key={`${item.query}-${index}`}
            className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-all duration-200 bg-secondary/20"
          >
            <FontAwesomeIcon
              icon={faHistory}
              className="text-xs text-muted-foreground/50 group-hover:text-primary/70 flex-shrink-0"
            />
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
              className="px-2 py-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
              title="Supprimer cette entrée"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

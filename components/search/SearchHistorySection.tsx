"use client";

import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { SearchHistory } from "@/hooks/useSearchHistory";

interface SearchHistorySectionProps {
  history: SearchHistory[];
  onSelectHistory: (query: string) => void;
  onRemoveHistory: (query: string) => void;
  onClearAll: () => void;
}

export function SearchHistorySection({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearAll,
}: SearchHistorySectionProps) {
  const [swipingIndex, setSwipingIndex] = useState<number | null>(null);
  const swipeStartRef = useRef<number>(0);
  const swipeYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartRef.current = e.touches[0].clientX;
    swipeYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = swipeStartRef.current - currentX; // Positif quand on swipe à gauche
    const diffY = Math.abs(swipeYRef.current - currentY);

    // Détecte un swipe horizontal (au moins 40px) sans mouvement vertical significatif
    if (diffX > 40 && diffY < 20) {
      e.preventDefault();
      setSwipingIndex(index);
    }
  };

  const handleTouchEnd = (index: number, query: string) => {
    // Si on était en train de swiper cet élément, le supprimer
    if (swipingIndex === index) {
      onRemoveHistory(query);
    }
    setSwipingIndex(null);
  };

  const handleTouchCancel = () => {
    setSwipingIndex(null);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24 text-muted-foreground">
        <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3 opacity-20" />
        <p className="text-sm font-medium">Aucune recherche récente</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-b from-card to-card/50 border border-border rounded-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/20">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <FontAwesomeIcon icon={faHistory} className="text-xs opacity-70" />
          Historique ({history.length})
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-semibold text-red-500/70 hover:text-red-500 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1"
          title="Supprimer tout l'historique"
        >
          <FontAwesomeIcon icon={faTrash} className="text-xs" />
          <span className="hidden sm:inline">Tout effacer</span>
        </button>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
        {history.map((item, index) => (
          <div
            key={`${item.query}-${index}`}
            className="relative group"
            onTouchStart={handleTouchStart}
            onTouchMove={(e) => handleTouchMove(e, index)}
            onTouchEnd={() => handleTouchEnd(index, item.query)}
            onTouchCancel={handleTouchCancel}
          >
            {/* Contenu principal avec animation */}
            <div
              className={`relative flex items-center gap-3 p-3.5 bg-secondary/0 hover:bg-primary/8 transition-all duration-300 ease-out overflow-hidden ${
                swipingIndex === index ? "-translate-x-16 bg-red-500/80" : "translate-x-0"
              }`}
            >
              <FontAwesomeIcon
                icon={faHistory}
                className="text-xs text-muted-foreground/40 group-hover:text-primary/60 flex-shrink-0 transition-colors"
              />
              <span
                onClick={() => {
                  onSelectHistory(item.query);
                  setSwipingIndex(null);
                }}
                className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors cursor-pointer truncate"
              >
                {item.query}
              </span>

              {/* Delete icon - toujours visible, change de couleur au swipe */}
              <div
                className={`flex items-center justify-center w-6 h-6 flex-shrink-0 transition-all duration-300 ${
                  swipingIndex === index
                    ? "text-white opacity-100"
                    : "text-muted-foreground/40 group-hover:text-red-500/60"
                }`}
              >
                <FontAwesomeIcon icon={faTrash} className="text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

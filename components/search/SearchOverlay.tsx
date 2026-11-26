"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
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
 * Recherche plein écran, calée sur la zone visible pour rester au-dessus du clavier.
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
  const [viewport, setViewport] = useState({ height: 0, offsetTop: 0 });

  const { query, setQuery, results, isLoading, hasSearched } = useSearchToys();
  const { searchHistory, addToHistory, removeFromHistory, clearAllHistory } =
    useSearchHistory();

  useEffect(() => {
    if (!isOpen) {
      inputRef.current?.blur();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const updateViewport = () => {
      const visual = window.visualViewport;
      setViewport({
        height: visual?.height ?? window.innerHeight,
        offsetTop: visual?.offsetTop ?? 0,
      });
    };

    updateViewport();
    window.visualViewport?.addEventListener("resize", updateViewport);
    window.visualViewport?.addEventListener("scroll", updateViewport);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.visualViewport?.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("scroll", updateViewport);
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery("");
    inputRef.current?.blur();
    onClose();
  }, [setQuery, onClose]);

  const handleSelectToy = useCallback(
    (toy: ToyWithTheme) => {
      addToHistory(toy.nom);
      router.push(`/${createSlug(toy.theme_name)}?selectedToyId=${toy.id}`);
      handleClose();
    },
    [addToHistory, router, handleClose]
  );

  const handleSelectHistory = useCallback(
    (historyQuery: string) => {
      setQuery(historyQuery);
      addToHistory(historyQuery);
    },
    [setQuery, addToHistory]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 z-[80] flex flex-col bg-background"
      style={{
        top: viewport.offsetTop,
        height: viewport.height || "100dvh",
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 shrink-0">
        <h2 className="flex-1 text-xl font-bold font-title">Recherche</h2>
        <button
          onClick={handleClose}
          className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center"
          aria-label="Fermer la recherche"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <div className="relative flex items-center bg-card border-2 border-border rounded-2xl">
          <div className="pl-4 text-muted-foreground">
            <FontAwesomeIcon
              icon={isLoading ? faSpinner : faSearch}
              className={isLoading ? "animate-spin text-primary" : ""}
            />
          </div>
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, numéro, thème…"
            className="search-input w-full bg-transparent py-4 pl-3 pr-4 text-base text-left text-foreground outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col">
        {hasSearched ? (
          <SearchResultsList
            isLoading={isLoading}
            results={results}
            query={query}
            onSelectToy={handleSelectToy}
          />
        ) : (
          <SearchHistorySection
            history={searchHistory}
            onSelectHistory={handleSelectHistory}
            onRemoveHistory={removeFromHistory}
            onClearAll={clearAllHistory}
          />
        )}
      </div>
    </div>
  );
}

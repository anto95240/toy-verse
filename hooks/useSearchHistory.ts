import { useState, useCallback, useEffect } from "react";

export interface SearchHistory {
  query: string;
  timestamp: number;
}

const SEARCH_HISTORY_KEY = "toy-verse-search-history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Hook for managing search history with localStorage persistence
 * Handles adding, removing, and clearing search history entries
 */
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  // Load history from localStorage on mount
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

  // Add search query to history
  const addToHistory = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    setSearchHistory((prev) => {
      // Remove if already in history (avoid duplicates)
      const filtered = prev.filter((item) => item.query !== trimmed);
      // Add to beginning
      const updated = [{ query: trimmed, timestamp: Date.now() }, ...filtered];
      // Limit to MAX_HISTORY_ITEMS
      const limited = updated.slice(0, MAX_HISTORY_ITEMS);
      // Persist to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limited));
      } catch (error) {
        console.error("Failed to save search history:", error);
      }
      return limited;
    });
  }, []);

  // Remove specific query from history
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

  // Clear all history
  const clearAllHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, []);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearAllHistory,
  };
}

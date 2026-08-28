import { useState, useEffect, useRef, useCallback } from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import type { SmartSelectItem } from "@/components/ui/SmartSelect";

export function useSmartSelect(
  entityType: ReferentialEntityKey,
  onChange: (item: SmartSelectItem | null) => void,
  componentId: string
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SmartSelectItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recherche avec debounce
  const search = useCallback(
    async (q: string) => {
      if (q.trim().length === 0) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/referential/search?entity=${entityType}&q=${encodeURIComponent(q)}&limit=8`
        );
        const json = await res.json();
        setResults(json.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [entityType]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Fermer en cliquant en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (inputRef.current && !inputRef.current.closest("[data-smart-select]")?.contains(target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: SmartSelectItem) {
    onChange(item);
    setQuery("");
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }

  function handleCreateNew() {
    const trimmed = query.trim();
    if (!trimmed) return;
    // Crée un item temporaire avec un ID préfixé "new:"
    // Le server action gérera la création réelle
    const newItem: SmartSelectItem = {
      id: `new:${trimmed}`,
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
    };
    handleSelect(newItem);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") setIsOpen(true);
      return;
    }
    const total = results.length + (query.trim() ? 1 : 0); // +1 pour "Créer"
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, total - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        } else if (highlightedIndex === results.length) {
          handleCreateNew();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    loading,
    highlightedIndex,
    setHighlightedIndex,
    inputRef,
    listRef,
    handleSelect,
    handleClear,
    handleCreateNew,
    handleKeyDown,
  };
}

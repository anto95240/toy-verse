import { useState, useEffect, useRef, useCallback } from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import type { SmartSelectItem } from "@/components/ui/SmartSelect";

export function useSmartSelect(
  entityType: ReferentialEntityKey,
  onChange: (item: SmartSelectItem | null) => void,
  componentId: string,
  excludeIds: string[] = []
) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SmartSelectItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [createError, setCreateError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excludeIdsRef = useRef(excludeIds);

  useEffect(() => {
    excludeIdsRef.current = excludeIds;
  }, [excludeIds]);

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
        const allResults = json.results ?? [];
        const filtered = allResults.filter((r: SmartSelectItem) => !excludeIdsRef.current.includes(r.id));
        setResults(filtered);
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

  async function handleCreateNew() {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/migration/create-entity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, name: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data.entity?.id) {
        setCreateError(data.error || "Impossible d'enregistrer cette entrée");
        return;
      }
      handleSelect({
        id: data.entity.id,
        name: data.entity.name,
        slug: data.entity.slug,
      });
    } catch {
      setCreateError("Erreur réseau lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
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
    createError,
  };
}

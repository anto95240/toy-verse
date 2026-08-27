"use client";

/**
 * components/ui/SmartSelectMulti.tsx
 *
 * Variante multi-sélection de SmartSelect.
 * Utilisé pour les personnages (un jouet peut représenter Woody ET Buzz).
 *
 * Usage :
 *   <SmartSelectMulti
 *     entityType="character"
 *     label="Personnages"
 *     values={selectedCharacters}
 *     onChange={setSelectedCharacters}
 *   />
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import type { SmartSelectItem } from "./SmartSelect";

interface SmartSelectMultiProps {
  entityType: ReferentialEntityKey;
  label: string;
  placeholder?: string;
  values: SmartSelectItem[];
  onChange: (items: SmartSelectItem[]) => void;
  disabled?: boolean;
  id?: string;
}

export default function SmartSelectMulti({
  entityType,
  label,
  placeholder,
  values,
  onChange,
  disabled = false,
  id,
}: SmartSelectMultiProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SmartSelectItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const componentId = id ?? `smart-select-multi-${entityType}`;

  const search = useCallback(
    async (q: string) => {
      if (q.trim().length === 0) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/referential/search?entity=${entityType}&q=${encodeURIComponent(q)}&limit=8`
        );
        const json = await res.json();
        // Exclure les items déjà sélectionnés
        const filtered = (json.results ?? []).filter(
          (r: SmartSelectItem) => !values.find((v) => v.id === r.id)
        );
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [entityType, values]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (inputRef.current && !inputRef.current.closest("[data-smart-select-multi]")?.contains(target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: SmartSelectItem) {
    onChange([...values, item]);
    setQuery("");
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }

  function handleRemove(itemId: string) {
    onChange(values.filter((v) => v.id !== itemId));
  }

  function handleCreateNew() {
    const trimmed = query.trim();
    if (!trimmed) return;
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
    const total = results.length + (query.trim() ? 1 : 0);
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setHighlightedIndex((i) => Math.min(i + 1, total - 1)); break;
      case "ArrowUp":   e.preventDefault(); setHighlightedIndex((i) => Math.max(i - 1, -1)); break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) handleSelect(results[highlightedIndex]);
        else if (highlightedIndex === results.length) handleCreateNew();
        break;
      case "Escape": setIsOpen(false); setHighlightedIndex(-1); break;
      case "Backspace":
        if (query === "" && values.length > 0) handleRemove(values[values.length - 1].id);
        break;
    }
  }

  const entityLabels: Record<ReferentialEntityKey, string> = {
    category: "catégorie", studio: "studio", license: "licence",
    franchise: "franchise", character: "personnage", location: "lieu",
  };

  return (
    <div className="space-y-1" data-smart-select-multi>
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      <div className="relative">
        {/* Tags sélectionnés + input */}
        <div
          className="flex flex-wrap gap-1.5 w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm min-h-[40px] cursor-text focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-400/50 transition-all"
          onClick={() => inputRef.current?.focus()}
        >
          {values.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 bg-blue-600/30 border border-blue-400/30 text-blue-200 text-xs px-2 py-0.5 rounded-full"
            >
              {item.name}
              {item.id.startsWith("new:") && (
                <span className="text-amber-400">*</span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                  aria-label={`Supprimer ${item.name}`}
                  className="hover:text-white transition-colors ml-0.5"
                >
                  ×
                </button>
              )}
            </span>
          ))}

          <input
            ref={inputRef}
            id={`${componentId}-input`}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setHighlightedIndex(-1); }}
            onFocus={() => { if (query.trim()) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? (placeholder ?? `Ajouter un ${entityLabels[entityType]}...`) : ""}
            disabled={disabled}
            className="flex-1 min-w-[140px] bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
            autoComplete="off"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <ul
            role="listbox"
            className="absolute z-50 top-full mt-1 w-full rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-hidden max-h-56 overflow-y-auto"
          >
            {loading && (
              <li className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-blue-400/50 border-t-blue-400 rounded-full shrink-0" />
                Recherche...
              </li>
            )}

            {!loading && results.length === 0 && query.trim().length > 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">
                Aucun résultat pour &ldquo;{query}&rdquo;
              </li>
            )}

            {!loading && results.map((item, i) => (
              <li
                key={item.id}
                role="option"
                aria-selected={i === highlightedIndex}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                  i === highlightedIndex ? "bg-blue-600/40 text-white" : "text-gray-200 hover:bg-white/10"
                }`}
              >
                <span className="font-medium">{item.name}</span>
                {item.matchedAlias && item.matchedAlias !== item.name && (
                  <span className="ml-2 text-xs text-gray-400">alias : {item.matchedAlias}</span>
                )}
              </li>
            ))}

            {!loading && query.trim().length > 0 && (
              <li
                role="option"
                aria-selected={highlightedIndex === results.length}
                onClick={handleCreateNew}
                onMouseEnter={() => setHighlightedIndex(results.length)}
                className={`px-3 py-2 cursor-pointer text-sm border-t border-white/10 flex items-center gap-2 transition-colors ${
                  highlightedIndex === results.length
                    ? "bg-green-600/40 text-green-300"
                    : "text-green-400 hover:bg-green-900/30"
                }`}
              >
                <span className="text-base">+</span>
                <span>
                  Créer <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span> comme nouveau {entityLabels[entityType]}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      {values.length > 0 && (
        <p className="text-xs text-gray-500">
          {values.length} {entityLabels[entityType]}{values.length > 1 ? "s" : ""} sélectionné{values.length > 1 ? "s" : ""}
          {" · "}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Tout effacer
          </button>
        </p>
      )}
    </div>
  );
}

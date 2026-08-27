"use client";

/**
 * components/ui/SmartSelect.tsx
 *
 * Sélecteur intelligent avec recherche assistée et création inline.
 * Remplace les <input type="text"> pour les champs de référentiel.
 *
 * Comportement :
 * - Recherche en temps réel (debounce 250ms)
 * - Affiche le name et l'alias correspondant dans les suggestions
 * - Option "Créer une nouvelle entrée" si aucun résultat
 * - Sélection unique (pour SmartSelectMulti, voir le composant dédié)
 *
 * Usage :
 *   <SmartSelect
 *     entityType="studio"
 *     label="Studio"
 *     placeholder="Rechercher un studio..."
 *     value={selectedStudio}
 *     onChange={setSelectedStudio}
 *   />
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ReferentialEntityKey } from "@/types/theme";

export type SmartSelectItem = {
  id: string;
  name: string;
  slug: string;
  matchedAlias?: string;
};

interface SmartSelectProps {
  /** Type d'entité à rechercher */
  entityType: ReferentialEntityKey;
  /** Label affiché au-dessus du composant */
  label: string;
  /** Placeholder du champ de recherche */
  placeholder?: string;
  /** Valeur sélectionnée (null si rien) */
  value: SmartSelectItem | null;
  /** Callback quand la sélection change */
  onChange: (item: SmartSelectItem | null) => void;
  /** Désactiver le composant (ex: pendant le chargement) */
  disabled?: boolean;
  /** Afficher le champ comme requis */
  required?: boolean;
  /** ID unique pour l'accessibilité */
  id?: string;
}

export default function SmartSelect({
  entityType,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  id,
}: SmartSelectProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SmartSelectItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const componentId = id ?? `smart-select-${entityType}`;

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

  const isNewItem = value?.id?.startsWith("new:");
  const entityLabels: Record<ReferentialEntityKey, string> = {
    category: "catégorie",
    studio: "studio",
    license: "licence",
    franchise: "franchise",
    character: "personnage",
    location: "lieu",
  };

  return (
    <div className="space-y-1" data-smart-select>
      <label
        htmlFor={`${componentId}-input`}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Valeur sélectionnée */}
        {value ? (
          <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
            <span className="flex-1 text-white text-sm truncate">
              {value.name}
              {isNewItem && (
                <span className="ml-2 text-xs text-amber-400 font-medium">
                  · nouveau
                </span>
              )}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                aria-label={`Supprimer ${value.name}`}
                className="text-gray-400 hover:text-white transition-colors shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-white/10"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          /* Champ de recherche */
          <input
            ref={inputRef}
            id={`${componentId}-input`}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={`${componentId}-listbox`}
            aria-activedescendant={
              highlightedIndex >= 0 ? `${componentId}-option-${highlightedIndex}` : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? `Rechercher un ${entityLabels[entityType]}...`}
            disabled={disabled}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 disabled:opacity-50 transition-all"
            autoComplete="off"
          />
        )}

        {/* Dropdown de résultats */}
        {isOpen && !value && (
          <ul
            ref={listRef}
            id={`${componentId}-listbox`}
            role="listbox"
            aria-label={`Suggestions pour ${label}`}
            className="absolute z-50 top-full mt-1 w-full rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
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
                id={`${componentId}-option-${i}`}
                role="option"
                aria-selected={i === highlightedIndex}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(i)}
                className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                  i === highlightedIndex
                    ? "bg-blue-600/40 text-white"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                <span className="font-medium">{item.name}</span>
                {item.matchedAlias && item.matchedAlias !== item.name && (
                  <span className="ml-2 text-xs text-gray-400">
                    alias : {item.matchedAlias}
                  </span>
                )}
              </li>
            ))}

            {/* Option "Créer une nouvelle entrée" */}
            {!loading && query.trim().length > 0 && (
              <li
                id={`${componentId}-option-${results.length}`}
                role="option"
                aria-selected={highlightedIndex === results.length}
                onClick={handleCreateNew}
                onMouseEnter={() => setHighlightedIndex(results.length)}
                className={`px-3 py-2 cursor-pointer text-sm border-t border-white/10 transition-colors flex items-center gap-2 ${
                  highlightedIndex === results.length
                    ? "bg-green-600/40 text-green-300"
                    : "text-green-400 hover:bg-green-900/30"
                }`}
              >
                <span className="text-base">+</span>
                <span>
                  Créer{" "}
                  <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span>{" "}
                  comme nouveau {entityLabels[entityType]}
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

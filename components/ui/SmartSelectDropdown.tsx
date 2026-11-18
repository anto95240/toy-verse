import React from "react";
import type { SmartSelectItem } from "./SmartSelect";
import type { ReferentialEntityKey } from "@/types/theme";

interface SmartSelectDropdownProps {
  componentId: string;
  listRef: React.RefObject<HTMLUListElement | null>;
  loading: boolean;
  results: SmartSelectItem[];
  query: string;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  handleSelect: (item: SmartSelectItem) => void;
  handleCreateNew: () => void;
  entityType: ReferentialEntityKey;
  createError?: string | null;
}

const entityLabels: Record<ReferentialEntityKey, string> = {
  category: "catégorie",
  studio: "studio",
  license: "licence",
  franchise: "franchise",
  character: "personnage",
  location: "lieu",
};

export function SmartSelectDropdown({
  componentId,
  listRef,
  loading,
  results,
  query,
  highlightedIndex,
  setHighlightedIndex,
  handleSelect,
  handleCreateNew,
  entityType,
  createError,
}: SmartSelectDropdownProps) {
  return (
    <ul
      ref={listRef}
      id={`${componentId}-listbox`}
      role="listbox"
      aria-label="Suggestions"
      className="absolute z-50 top-full mt-1 w-full rounded-lg border border-white/20 bg-gray-900/95 backdrop-blur-md shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
    >
      {loading && (
        <li className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
          <span className="animate-spin w-4 h-4 border-2 border-blue-400/50 border-t-blue-400 rounded-full shrink-0" />
          Recherche...
        </li>
      )}

      {!loading && createError && (
        <li className="px-3 py-2 text-sm text-red-300">{createError}</li>
      )}

      {!loading && results.length === 0 && query.trim().length > 0 && !createError && (
        <li className="px-3 py-2 text-sm text-gray-400">
          Aucun résultat pour &ldquo;{query}&rdquo;
        </li>
      )}

      {!loading &&
        results.map((item, i) => (
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
            Créer <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span> comme
            nouveau {entityLabels[entityType]}
          </span>
        </li>
      )}
    </ul>
  );
}

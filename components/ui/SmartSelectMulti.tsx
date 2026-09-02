"use client";

import React from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import type { SmartSelectItem } from "./SmartSelect";
import { useSmartSelect } from "@/hooks/ui/useSmartSelect";
import { SmartSelectDropdown } from "./SmartSelectDropdown";

interface SmartSelectMultiProps {
  entityType: ReferentialEntityKey;
  label: string;
  placeholder?: string;
  values: SmartSelectItem[];
  onChange: (items: SmartSelectItem[]) => void;
  disabled?: boolean;
  id?: string;
}

const entityLabels: Record<ReferentialEntityKey, string> = {
  category: "catégorie", studio: "studio", license: "licence",
  franchise: "franchise", character: "personnage", location: "lieu",
};

export default function SmartSelectMulti({
  entityType,
  label,
  placeholder,
  values,
  onChange,
  disabled = false,
  id,
}: SmartSelectMultiProps) {
  const componentId = id ?? `smart-select-multi-${entityType}`;
  
  const {
    query, setQuery, results, isOpen, setIsOpen,
    loading, highlightedIndex, setHighlightedIndex,
    inputRef, listRef, handleSelect, handleCreateNew, handleKeyDown,
  } = useSmartSelect(
    entityType,
    (item) => {
      if (item) onChange([...values, item]);
    },
    componentId,
    values.map(v => v.id)
  );

  function handleRemove(itemId: string) {
    onChange(values.filter((v) => v.id !== itemId));
  }

  function handleMultiKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Backspace" && query === "" && values.length > 0) {
      handleRemove(values[values.length - 1].id);
      return;
    }
    handleKeyDown(e);
  }

  return (
    <div className="space-y-1" data-smart-select>
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
            onKeyDown={handleMultiKeyDown}
            placeholder={values.length === 0 ? (placeholder ?? `Ajouter un ${entityLabels[entityType]}...`) : ""}
            disabled={disabled}
            className="flex-1 min-w-[140px] bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
            autoComplete="off"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <SmartSelectDropdown
            componentId={componentId}
            listRef={listRef}
            loading={loading}
            results={results}
            query={query}
            highlightedIndex={highlightedIndex}
            setHighlightedIndex={setHighlightedIndex}
            handleSelect={handleSelect}
            handleCreateNew={handleCreateNew}
            entityType={entityType}
          />
        )}
      </div>
    </div>
  );
}

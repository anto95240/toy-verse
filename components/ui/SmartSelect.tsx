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

import React from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import { useSmartSelect } from "@/hooks/ui/useSmartSelect";
import { SmartSelectDropdown } from "./SmartSelectDropdown";

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
  const componentId = id ?? `smart-select-${entityType}`;

  const {
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
  } = useSmartSelect(entityType, onChange, componentId);

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
          <div 
            onClick={() => {
              if (disabled) return;
              onChange(null);
              setQuery(value.name);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm transition-colors ${!disabled ? 'cursor-text hover:border-blue-400/50 hover:bg-white/20' : 'opacity-70'}`}
          >
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
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

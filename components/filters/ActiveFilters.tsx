import React from "react";

interface FiltersState {
  categories: string[];
  subcategories?: string[];
  studios: string[];
  locations?: string[];
  nbPiecesRange: string;
  releaseYear: string;
  isExposed: boolean | null;
  isSoon: boolean | null;
}

interface ActiveFiltersProps {
  filters: FiltersState;
  onReset: () => void;
  actions: {
    toggleCat: (v: string) => void;
    toggleSub?: (v: string) => void;
    toggleStudio: (v: string) => void;
    toggleLocation?: (v: string) => void;
    setPieces: (v: string) => void;
    setYear: (v: string) => void;
    setExposed: (v: boolean | null) => void;
    setSoon: (v: boolean | null) => void;
  };
}

export const ActiveFilters = ({
  filters,
  onReset,
  actions,
}: ActiveFiltersProps) => {
  const Chip = ({
    label,
    onRemove,
  }: {
    label: string;
    onRemove: () => void;
  }) => (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center px-3 py-1.5 text-xs bg-secondary text-foreground rounded-lg border border-border hover:bg-secondary/80 transition-colors"
    >
      {label} <span className="ml-2 font-bold opacity-60">×</span>
    </button>
  );

  return (
    <div className="mb-6 p-3 bg-secondary/40 border border-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-foreground text-sm">Filtres actifs</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Tout effacer
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.categories.map((c: string) => (
          <Chip key={`cat-${c}`} label={c} onRemove={() => actions.toggleCat(c)} />
        ))}
        {(filters.subcategories || []).map((s: string) => (
          <Chip
            key={`sub-${s}`}
            label={s}
            onRemove={() => actions.toggleSub?.(s)}
          />
        ))}
        {filters.studios.map((s: string) => (
          <Chip
            key={`stu-${s}`}
            label={s}
            onRemove={() => actions.toggleStudio(s)}
          />
        ))}
        {(filters.locations || []).map((l: string) => (
          <Chip
            key={`loc-${l}`}
            label={l}
            onRemove={() => actions.toggleLocation?.(l)}
          />
        ))}
        {filters.nbPiecesRange && (
          <Chip
            label={filters.nbPiecesRange}
            onRemove={() => actions.setPieces("")}
          />
        )}
        {filters.releaseYear && (
          <Chip
            label={`Année ${filters.releaseYear}`}
            onRemove={() => actions.setYear("")}
          />
        )}
        {filters.isExposed !== null && (
          <Chip
            label={filters.isExposed ? "Exposé" : "Non exposé"}
            onRemove={() => actions.setExposed(null)}
          />
        )}
        {filters.isSoon !== null && (
          <Chip
            label={filters.isSoon ? "Prochainement" : "Disponible"}
            onRemove={() => actions.setSoon(null)}
          />
        )}
      </div>
    </div>
  );
};

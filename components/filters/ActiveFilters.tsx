import React from "react";

interface ActiveFiltersProps {
  filters: any;
  onReset: () => void;
  actions: {
    toggleCat: (v: string) => void;
    toggleStudio: (v: string) => void;
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
    color,
    onRemove,
  }: {
    label: string;
    color: string;
    onRemove: () => void;
  }) => (
    <span
      onClick={onRemove}
      className={`inline-flex items-center px-3 py-2 text-xs bg-${color}-100 text-${color}-800 rounded-lg cursor-pointer hover:bg-${color}-200 transition-all border border-${color}-200`}
    >
      {label} <button className={`ml-2 text-${color}-600 font-bold`}>×</button>
    </span>
  );

  return (
    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
      <h3 className="font-semibold text-primary text-sm flex items-center mb-3">
        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>Filtres
        actifs
      </h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.categories.map((c: string) => (
          <Chip
            key={c}
            label={c}
            color="blue"
            onRemove={() => actions.toggleCat(c)}
          />
        ))}
        {filters.studios.map((s: string) => (
          <Chip
            key={s}
            label={s}
            color="green"
            onRemove={() => actions.toggleStudio(s)}
          />
        ))}
        {filters.nbPiecesRange && (
          <Chip
            label={filters.nbPiecesRange}
            color="purple"
            onRemove={() => actions.setPieces("")}
          />
        )}
        {filters.releaseYear && (
          <Chip
            label={`Année ${filters.releaseYear}`}
            color="indigo"
            onRemove={() => actions.setYear("")}
          />
        )}
        {filters.isExposed !== null && (
          <Chip
            label={filters.isExposed ? "Exposé" : "Non exposé"}
            color="orange"
            onRemove={() => actions.setExposed(null)}
          />
        )}
        {filters.isSoon !== null && (
          <Chip
            label={filters.isSoon ? "Wishlist" : "Actuel"}
            color="red"
            onRemove={() => actions.setSoon(null)}
          />
        )}
      </div>
      <button
        onClick={onReset}
        className="w-full px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:scale-[1.02] transition-all"
      >
        Réinitialiser
      </button>
    </div>
  );
};

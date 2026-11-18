import React from "react";

export default function EmptyState({
  isSearchActive,
  isFiltered = false,
  onClearSearch,
  onResetFilters,
}: {
  isSearchActive?: boolean;
  isFiltered?: boolean;
  onClearSearch?: () => void;
  onResetFilters?: () => void;
}) {
  const message = isSearchActive
    ? "Aucun résultat pour cette recherche."
    : isFiltered
      ? "Aucun jouet ne correspond à ces filtres."
      : "Cette collection est vide pour le moment.";

  return (
    <div className="text-center py-12 animate-in fade-in zoom-in-95">
      <div className="mb-4 text-6xl opacity-20">📦</div>
      <p className="text-muted-foreground text-lg mb-4">{message}</p>
      {isSearchActive && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-medium"
        >
          Effacer la recherche
        </button>
      )}
      {!isSearchActive && isFiltered && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-medium"
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );
}

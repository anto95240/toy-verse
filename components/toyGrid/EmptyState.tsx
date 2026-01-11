import React from "react";

export default function EmptyState({
  isSearchActive,
  onClearSearch,
}: {
  isSearchActive?: boolean;
  onClearSearch?: () => void;
}) {
  return (
    <div className="text-center py-12 animate-in fade-in zoom-in-95">
      <div className="mb-4 text-6xl opacity-20">📦</div>
      <p className="text-muted-foreground text-lg mb-4">
        {isSearchActive
          ? "Aucun résultat pour cette recherche."
          : "Cette collection est vide pour le moment."}
      </p>
      {isSearchActive && onClearSearch && (
        <button
          onClick={onClearSearch}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity font-medium"
        >
          Effacer la recherche
        </button>
      )}
    </div>
  );
}

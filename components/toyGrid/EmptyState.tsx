import React from "react"
import type { EmptyStateProps } from "@/types/toyGrid"

export default function EmptyState({
  isSearchActive,
  onClearSearch
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">
        {isSearchActive ? "Aucun jouet trouvé pour cette recherche." : "Aucun jouet trouvé pour ces critères."}
      </p>
      {isSearchActive && onClearSearch && (
        <button 
          onClick={onClearSearch}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Afficher tous les jouets
        </button>
      )}
    </div>
  )
}
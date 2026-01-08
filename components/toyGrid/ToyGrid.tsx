"use client"

import React from "react"
import ToyCard from "./ToyCard"
import EmptyState from "./EmptyState"
import type { ToyGridProps } from "@/types/toyGrid"

export default function ToyGrid({ 
  toys, 
  toyImageUrls, 
  onEditToy, 
  onDeleteToy,
  searchResults,
  isSearchActive = false,
  onClearSearch,
  currentThemeName,
  currentUserId
}: ToyGridProps) {
  
  // Si une recherche est active, on utilise les résultats, sinon la liste (déjà paginée par le parent)
  const toysToDisplay = isSearchActive && searchResults ? searchResults : toys
  
  // Vérifier si on affiche des jouets d'un thème différent
  const hasToysFromDifferentTheme = isSearchActive && searchResults && 
    searchResults.some(toy => toy.theme_name !== currentThemeName)

  if (toysToDisplay.length === 0) {
    return (
      <EmptyState
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
      />
    )
  }

  return (
    <div className="w-full">
      {hasToysFromDifferentTheme && (
        <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200 rounded-xl animate-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <div>
                <p className="font-bold text-blue-900 text-sm">
                  Résultats globaux
                </p>
                <p className="text-xs text-blue-700">
                  Inclut des jouets d'autres thèmes.
                </p>
              </div>
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="px-4 py-1.5 bg-white text-blue-600 border border-blue-200 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                Tout effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grille des jouets */}
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {toysToDisplay.map((toy, index) => (
          <div 
            key={toy.id} 
          >
            <ToyCard
              toy={toy}
              toyImageUrls={toyImageUrls}
              currentUserId={currentUserId}
              onEditToy={onEditToy}
              onDeleteToy={onDeleteToy}
              isFromDifferentTheme={toy.theme_name !== currentThemeName}
            />
          </div>
        ))}
      </ul>
    </div>
  )
}
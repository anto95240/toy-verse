"use client"

import React from "react"
import ToyCard from "./ToyCard"
import ThemeBanner from "./ThemeBanner"
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
  const toysToDisplay = isSearchActive && searchResults ? searchResults : toys
  
  const isShowingSpecificToy = isSearchActive && searchResults && searchResults.length === 1
  const specificToy = isShowingSpecificToy ? searchResults[0] : null

  // ✅ On force un boolean
  const isFromDifferentTheme = !!(
    specificToy &&
    currentThemeName &&
    specificToy.theme_name !== currentThemeName
  )

  if (toysToDisplay.length === 0) {
    return (
      <EmptyState
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
      />
    )
  }

  return (
    <div>
      <ThemeBanner
        isFromDifferentTheme={isFromDifferentTheme}
        themeName={specificToy?.theme_name}
        onClearSearch={onClearSearch}
      />

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-11 gap-y-12">
        {toysToDisplay.map(toy => (
          <ToyCard
            key={toy.id}
            toy={toy}
            toyImageUrls={toyImageUrls}
            currentUserId={currentUserId}
            onEditToy={onEditToy}
            onDeleteToy={onDeleteToy}
            isFromDifferentTheme={isFromDifferentTheme}
          />
        ))}
      </ul>
    </div>
  )
}

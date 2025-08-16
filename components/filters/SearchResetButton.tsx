import React from "react"

interface SearchResetButtonProps {
  isSearchActive: boolean
  onClearSearch?: () => void
  isMobile?: boolean
  onClose?: () => void
}

export default function SearchResetButton({
  isSearchActive,
  onClearSearch,
  isMobile,
  onClose
}: SearchResetButtonProps) {
  if (!isSearchActive || !onClearSearch) return null

  return (
    <div className="mb-6 p-3 bg-background border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-700 mb-2">Mode recherche actif</p>
      <button
        onClick={() => {
          onClearSearch()
          if (isMobile && onClose) onClose()
        }}
        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Afficher tous les jouets
      </button>
    </div>
  )
}
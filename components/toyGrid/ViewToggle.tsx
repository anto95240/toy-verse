import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBoxOpen, faStar } from "@fortawesome/free-solid-svg-icons"

interface ViewToggleProps {
  view: 'collection' | 'wishlist'
  setView: (view: 'collection' | 'wishlist') => void
  isHeader?: boolean
}

export default function ViewToggle({ view, setView, isHeader = false }: ViewToggleProps) {
  const baseClass = "flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200"
  const paddingClass = isHeader ? "px-3 py-1.5" : "px-4 py-2" // Plus compact dans le header
  
  return (
    <div className={`bg-muted/50 p-1 rounded-xl inline-flex w-full md:w-auto ${isHeader ? 'h-full' : ''}`}>
      <button
        onClick={() => setView('collection')}
        className={`flex-1 md:flex-none ${baseClass} ${paddingClass} ${
          view === 'collection'
            ? 'bg-background text-primary shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <FontAwesomeIcon icon={faBoxOpen} />
        Collection
      </button>
      <button
        onClick={() => setView('wishlist')}
        className={`flex-1 md:flex-none ${baseClass} ${paddingClass} ${
          view === 'wishlist'
            ? 'bg-background text-purple-600 shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <FontAwesomeIcon icon={faStar} />
        Wishlist
      </button>
    </div>
  )
}
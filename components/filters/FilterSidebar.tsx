"use client"

import React from "react"
import CategoryFilter from "./CategoryFilter"

interface FilterCounts {
  categories: Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed: Record<string, number>
  soon: Record<string, number>
}

interface Filters {
  categories: string[]
  nbPiecesRange: string
  isExposed: boolean | null
  isSoon: boolean | null
}

interface FilterSidebarProps {
  categories: string[]
  filters: Filters
  filterCounts: FilterCounts
  onToggleCategory: (category: string) => void
  onNbPiecesChange: (range: string) => void
  onExposedChange: (value: boolean | null) => void
  onSoonChange: (value: boolean | null) => void
  onResetFilters: () => void
  onClearSearch?: () => void
  isSearchActive?: boolean
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

// Composant pour le contenu des filtres (réutilisé entre desktop et mobile)
function FilterContent({
  categories,
  filters,
  filterCounts,
  onToggleCategory,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onResetFilters,
  onClearSearch,
  isSearchActive = false,
  isMobile,
  onClose
}: Omit<FilterSidebarProps, 'className'>) {
  return (
    <>
      {/* 🔍 Bouton de réinitialisation de recherche */}
      {isSearchActive && onClearSearch && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
      )}

      {/* Catégories avec recherche */}
      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={onToggleCategory}
        filterCounts={filterCounts.categories}
        onClose={isMobile ? onClose : undefined}
      />

      {/* Nombre de pièces */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Nombre de pièces</h3>
        <div className="space-y-2">
          {[
            { value: "0-200", label: "0 - 200 pièces" },
            { value: "201-500", label: "201 - 500 pièces" },
            { value: "501-1000", label: "501 - 1000 pièces" },
            { value: "1001-1500", label: "1001 - 1500 pièces" },
            { value: "1501-2000", label: "1501 - 2000 pièces" },
            { value: "", label: "Toutes les tailles" }
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center cursor-pointer group">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => onNbPiecesChange(value)} 
                checked={filters.nbPiecesRange === value}
                className="mr-2"
              />
              <span className="text-sm group-hover:text-blue-600 transition-colors">
                {label} {value && `(${filterCounts.nbPiecesRanges[value] || 0})`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* État d'exposition */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">État d&apos;exposition</h3>
        <div className="space-y-2">
          {[
            { value: true, label: "En exposition" },
            { value: false, label: "Non exposé" },
            { value: null, label: "Tous les états" }
          ].map(({ value, label }) => (
            <label key={String(value)} className="flex items-center cursor-pointer group">
              <input 
                type="radio" 
                name="expose" 
                onChange={() => onExposedChange(value)} 
                checked={filters.isExposed === value}
                className="mr-2"
              />
              <span className="text-sm group-hover:text-blue-600 transition-colors">
                {label} {value !== null && `(${filterCounts.exposed[String(value)] || 0})`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* État de nouveauté */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">État de nouveauté</h3>
        <div className="space-y-2">
          {[
            { value: true, label: "Prochainement" },
            { value: null, label: "Tous les états" }
          ].map(({ value, label }) => (
            <label key={String(value)} className="flex items-center cursor-pointer group">
              <input 
                type="radio" 
                name="soon" 
                onChange={() => onSoonChange(value)} 
                checked={filters.isSoon === value}
                className="mr-2"
              />
              <span className="text-sm group-hover:text-blue-600 transition-colors">
                {label} {value !== null && `(${filterCounts.soon[String(value)] || 0})`}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <button
        onClick={onResetFilters}
        className="w-full px-3 py-2 text-sm bg-gray-200 text-black rounded-md hover:bg-gray-300 transition-colors"
      >
        Réinitialiser tous les filtres
      </button>
    </>
  )
}

export default function FilterSidebar({
  categories,
  filters,
  filterCounts,
  onToggleCategory,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onResetFilters,
  onClearSearch,
  isSearchActive = false,
  className = "",
  isMobile = false,
  onClose
}: FilterSidebarProps) {
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        
        {/* Sidebar mobile */}
        <div className="fixed top-0 right-0 h-full w-80 bg-bg-second z-50 shadow-lg overflow-y-auto">
          {/* Header avec croix */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-bold text-lg">Filtres</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
              aria-label="Fermer les filtres"
            >
              ×
            </button>
          </div>
          
          {/* Contenu des filtres */}
          <div className="p-4">
            <FilterContent 
              categories={categories}
              filters={filters}
              filterCounts={filterCounts}
              onToggleCategory={onToggleCategory}
              onNbPiecesChange={onNbPiecesChange}
              onExposedChange={onExposedChange}
              onSoonChange={onSoonChange}
              onResetFilters={onResetFilters}
              onClearSearch={onClearSearch}
              isSearchActive={isSearchActive}
              isMobile={isMobile}
              onClose={onClose}
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <div className={`bg-bg-second p-4 fixed top-24 left-4 rounded-lg shadow-lg z-30 h-fit max-h-[calc(100vh-120px)] overflow-y-auto ${className}`}>
      {!isMobile && <h2 className="mb-4 font-bold text-lg">Filtres</h2>}
      
      <FilterContent 
        categories={categories}
        filters={filters}
        filterCounts={filterCounts}
        onToggleCategory={onToggleCategory}
        onNbPiecesChange={onNbPiecesChange}
        onExposedChange={onExposedChange}
        onSoonChange={onSoonChange}
        onResetFilters={onResetFilters}
        onClearSearch={onClearSearch}
        isSearchActive={isSearchActive}
        isMobile={isMobile}
        onClose={onClose}
      />
    </div>
  )
}
'use client'

import React from 'react'
import CategoryFilter from './CategoryFilter'

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
  className?: string
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
  className = ""
}: FilterSidebarProps) {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <h2 className="mb-4 font-bold text-lg">Filtres</h2>

      {/* Catégories avec recherche */}
      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={onToggleCategory}
        filterCounts={filterCounts.categories}
      />

      {/* Nombre de pièces */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Nombre de pièces</h3>
        <div className="space-y-2">
          {[
            { value: '100-200', label: '100 - 200 pièces' },
            { value: '200-500', label: '200 - 500 pièces' },
            { value: '500-1000', label: '500 - 1000 pièces' },
            { value: '+1000', label: 'Plus de 1000 pièces' },
            { value: '', label: 'Toutes les tailles' }
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
        <h3 className="font-medium mb-3">État d'exposition</h3>
        <div className="space-y-2">
          {[
            { value: true, label: 'En exposition' },
            { value: false, label: 'Non exposé' },
            { value: null, label: 'Tous les états' }
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
            { value: true, label: 'Prochainement' },
            { value: null, label: 'Tous les états' }
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
    </div>
  )
}
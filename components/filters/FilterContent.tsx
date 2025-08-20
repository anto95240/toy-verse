import React from "react"
import CategoryFilter from "./CategoryFilter"
import StudioFilter from "./StudioFilter"
import PiecesRangeFilter from "./PiecesRangeFilter"
import ExposureFilter from "./ExposureFilter"
import SoonFilter from './SoonFilter'
import YearFilter from './YearFilter'
import SearchResetButton from './SearchResetButton'
import type { FilterContentProps } from "@/types/filters"

export default function FilterContent({
  categories,
  studios,
  filters,
  filterCounts,
  onToggleCategory,
  onToggleStudio,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onResetFilters,
  onClearSearch,
  isSearchActive = false,
  isMobile = false,
  onClose,
  releaseYears,
  onReleaseYearChange
}: FilterContentProps) {
  // Vérifier si des filtres sont actifs
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.studios.length > 0 ||
    filters.nbPiecesRange !== '' ||
    filters.isExposed !== null ||
    filters.isSoon !== null ||
    filters.releaseYear !== ''

  return (
    <>
      <SearchResetButton
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
        isMobile={isMobile}
        onClose={onClose}
      />

      {/* Section des filtres actifs */}
      {hasActiveFilters && (
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center mb-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Filtres actifs
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* Catégories actives - limitées à 2 par ligne */}
              {filters.categories.map(cat => (
                <span
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className="inline-flex items-center px-3 py-2 text-xs bg-blue-100 text-blue-800 rounded-lg cursor-pointer hover:bg-blue-200 transition-all shadow-sm border border-blue-200"
                >
                  {cat}
                  <button className="ml-2 text-blue-600 hover:text-blue-800 font-bold">×</button>
                </span>
              ))}

              {/* Studios actifs */}
              {filters.studios.map(studio => (
                <span
                  key={studio}
                  onClick={() => onToggleStudio(studio)}
                  className="inline-flex items-center px-3 py-2 text-xs bg-green-100 text-green-800 rounded-lg cursor-pointer hover:bg-green-200 transition-all shadow-sm border border-green-200"
                >
                  {studio}
                  <button className="ml-2 text-green-600 hover:text-green-800 font-bold">×</button>
                </span>
              ))}

              {/* Nombre de pièces actif */}
              {filters.nbPiecesRange && (
                <span
                  onClick={() => onNbPiecesChange('')}
                  className="inline-flex items-center px-3 py-2 text-xs bg-purple-100 text-purple-800 rounded-lg cursor-pointer hover:bg-purple-200 transition-all shadow-sm border border-purple-200"
                >
                  {filters.nbPiecesRange} pièces
                  <button className="ml-2 text-purple-600 hover:text-purple-800 font-bold">×</button>
                </span>
              )}

              {/* Exposition active */}
              {filters.isExposed !== null && (
                <span
                  onClick={() => onExposedChange(null)}
                  className="inline-flex items-center px-3 py-2 text-xs bg-orange-100 text-orange-800 rounded-lg cursor-pointer hover:bg-orange-200 transition-all shadow-sm border border-orange-200"
                >
                  {filters.isExposed ? 'Exposé' : 'Non exposé'}
                  <button className="ml-2 text-orange-600 hover:text-orange-800 font-bold">×</button>
                </span>
              )}

              {/* Bientôt actif */}
              {filters.isSoon !== null && (
                <span
                  onClick={() => onSoonChange(null)}
                  className="inline-flex items-center px-3 py-2 text-xs bg-red-100 text-red-800 rounded-lg cursor-pointer hover:bg-red-200 transition-all shadow-sm border border-red-200"
                >
                  {filters.isSoon ? 'Prochainement' : 'Pas prochainement'}
                  <button className="ml-2 text-red-600 hover:text-red-800 font-bold">×</button>
                </span>
              )}

              {/* Année de sortie active */}
              {filters.releaseYear && (
                <span
                  onClick={() => onReleaseYearChange('')}
                  className="inline-flex items-center px-3 py-2 text-xs bg-indigo-100 text-indigo-800 rounded-lg cursor-pointer hover:bg-indigo-200 transition-all shadow-sm border border-indigo-200"
                >
                  {filters.releaseYear}
                  <button className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold">×</button>
                </span>
              )}
            </div>

            <button
              onClick={onResetFilters}
              className="w-full px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        </div>
      )}

      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onToggleCategory={onToggleCategory}
        filterCounts={filterCounts.categories}
      />

      <StudioFilter
        studios={studios}
        selectedStudios={filters.studios}
        onToggleStudio={onToggleStudio}
        filterCounts={filterCounts.studios}
      />

      <PiecesRangeFilter
        selectedRange={filters.nbPiecesRange}
        filterCounts={filterCounts.nbPiecesRanges}
        onRangeChange={onNbPiecesChange}
      />

      <ExposureFilter
        selectedValue={filters.isExposed}
        filterCounts={filterCounts.exposed}
        onValueChange={onExposedChange}
      />

      <SoonFilter
        selectedValue={filters.isSoon}
        onValueChange={onSoonChange}
        filterCounts={filterCounts.soon}
      />

      <YearFilter
        releaseYears={releaseYears || []}
        selectedYear={filters.releaseYear || ''}
        onYearChange={onReleaseYearChange}
        filterCounts={filterCounts.releaseYears}
        isMobile={isMobile}
      />
    </>
  )
}
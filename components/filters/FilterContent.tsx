
import React, { useState } from "react"
import MultiSelectFilter from "./MultiSelectFilter"
import SingleSelectFilter from "./SingleSelectFilter"
import BooleanFilter from "./BooleanFilter"
import SearchResetButton from './SearchResetButton'
import type { FilterContentProps } from "@/types/filters"
import { 
  faTags, 
  faBuilding, 
  faCubes, 
  faCalendarAlt, 
  faEye, 
  faClock 
} from '@fortawesome/free-solid-svg-icons'

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
  // États pour gérer le collapse de chaque filtre
  const [collapsedStates, setCollapsedStates] = useState({
    categories: true,
    studios: true,
    pieces: true,
    year: true,
    exposure: true,
    soon: true
  })

  const toggleCollapse = (filterType: keyof typeof collapsedStates) => {
    setCollapsedStates(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }))
  }

  // Vérifier si des filtres sont actifs
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.studios.length > 0 ||
    filters.nbPiecesRange !== '' ||
    filters.isExposed !== null ||
    filters.isSoon !== null ||
    filters.releaseYear !== ''
    
  const totalFilteredToys = filterCounts.totalToys || 0

  // Options pour les filtres de range de pièces
  const piecesOptions = [
    { value: '0-200', label: '0 - 200 pièces' },
    { value: '201-500', label: '201 - 500 pièces' },
    { value: '501-1000', label: '501 - 1000 pièces' },
    { value: '1001-1500', label: '1001 - 1500 pièces' },
    { value: '1501-2000', label: '1501 - 2000 pièces' },
    { value: '2000+', label: '2000+ pièces' },
    { value: '', label: 'Toutes les tailles' }
  ]

  // Options pour les années
  const yearOptions = [
    ...releaseYears
      .sort((a, b) => parseInt(b) - parseInt(a)) // Tri décroissant
      .map(year => ({ 
        value: year, 
        label: `${year}` 
      })),
    { value: '', label: 'Toutes les années' }
  ]

  // Options pour l'exposition
  const exposureOptions = [
    { value: true, label: 'Exposé' },
    { value: false, label: 'Non exposé' },
    { value: null, label: 'Tous' }
  ]

  // Options pour "bientôt"
  const soonOptions = [
    { value: true, label: 'Prochainement' },
    { value: false, label: 'Pas prochainement' },
    { value: null, label: 'Tous' }
  ]

  return (
    <>
      <SearchResetButton
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
        isMobile={isMobile}
        onClose={onClose}
      />
      
      {/* NOUVEAU: Section statistiques globales */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl shadow-sm">
        <h3 className="font-semibold text-text-prim text-sm flex items-center mb-3">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          Statistiques
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalFilteredToys}
            </div>
            <div className="text-xs text-gray-600">Total jouets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(filterCounts.releaseYears).reduce((sum, count) => sum + count, 0)}
            </div>
            <div className="text-xs text-gray-600">Avec année</div>
          </div>
        </div>
      </div>

      {/* Section des filtres actifs */}
      {hasActiveFilters && (
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="mb-3">
            <h3 className="font-semibold text-text-prim text-sm flex items-center mb-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Filtres actifs
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {/* Catégories actives */}
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
                  {piecesOptions.find(opt => opt.value === filters.nbPiecesRange)?.label || filters.nbPiecesRange}
                  <button className="ml-2 text-purple-600 hover:text-purple-800 font-bold">×</button>
                </span>
              )}

              {/* Année de sortie active */}
              {filters.releaseYear && (
                <span
                  onClick={() => onReleaseYearChange('')}
                  className="inline-flex items-center px-3 py-2 text-xs bg-indigo-100 text-indigo-800 rounded-lg cursor-pointer hover:bg-indigo-200 transition-all shadow-sm border border-indigo-200"
                >
                  Année {filters.releaseYear}
                  <button className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold">×</button>
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

      <MultiSelectFilter
        title="Catégories"
        colorScheme="blue"
        items={categories}
        selectedItems={filters.categories}
        onToggleItem={onToggleCategory}
        filterCounts={filterCounts.categories}
        searchable={true}
        maxDisplayed={5}
        isCollapsed={collapsedStates.categories}
        onToggleCollapse={() => toggleCollapse('categories')}
        icon={faTags}
      />

      <MultiSelectFilter
        title="Studios / Licenses"
        colorScheme="green"
        items={studios}
        selectedItems={filters.studios}
        onToggleItem={onToggleStudio}
        filterCounts={filterCounts.studios}
        searchable={true}
        maxDisplayed={5}
        isCollapsed={collapsedStates.studios}
        onToggleCollapse={() => toggleCollapse('studios')}
        icon={faBuilding}
      />

      <SingleSelectFilter
        title="Nombre de pièces"
        colorScheme="purple"
        options={piecesOptions}
        selectedValue={filters.nbPiecesRange}
        onValueChange={onNbPiecesChange}
        filterCounts={filterCounts.nbPiecesRanges}
        isCollapsed={collapsedStates.pieces}
        onToggleCollapse={() => toggleCollapse('pieces')}
        icon={faCubes}
      />

      <SingleSelectFilter
        title="Année de sortie"
        colorScheme="indigo"
        options={yearOptions}
        selectedValue={filters.releaseYear || ''}
        onValueChange={onReleaseYearChange}
        filterCounts={filterCounts.releaseYears}
        isCollapsed={collapsedStates.year}
        onToggleCollapse={() => toggleCollapse('year')}
        icon={faCalendarAlt}
      />

      <BooleanFilter
        title="Exposition"
        colorScheme="orange"
        options={exposureOptions}
        selectedValue={filters.isExposed}
        onValueChange={onExposedChange}
        filterCounts={filterCounts.exposed}
        isCollapsed={collapsedStates.exposure}
        onToggleCollapse={() => toggleCollapse('exposure')}
        icon={faEye}
      />

      <BooleanFilter
        title="Disponibilité"
        colorScheme="red"
        options={soonOptions}
        selectedValue={filters.isSoon}
        onValueChange={onSoonChange}
        filterCounts={filterCounts.soon}
        isCollapsed={collapsedStates.soon}
        onToggleCollapse={() => toggleCollapse('soon')}
        icon={faClock}
      />
    </>
  )
}


"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface CategoryFilterProps {
  categories: string[]
  selectedCategories: string[]
  onToggleCategory: (category: string) => void
  filterCounts: Record<string, number>
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
  filterCounts
}: CategoryFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)

   const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedCategories = showAll ? filteredCategories : filteredCategories.slice(0, 5)
  const hasMore = filteredCategories.length > 5

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-4 text-text-prim flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        Catégories
      </h3>
      
      <div className="mb-3">
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 text-sm text-text-prim border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-3">
        {displayedCategories.length === 0 ? (
          <p className="text-sm text-text-prim italic">
            {categories.length === 0 ? "Aucune catégorie disponible" : "Aucune catégorie trouvée"}
          </p>
        ) : (
          displayedCategories.map(category => (
            <label key={category} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-200">
              <input
                type="checkbox"
                onChange={() => onToggleCategory(category)}
                checked={selectedCategories.includes(category)}
                className="mr-3 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm transition-all flex-1 ${
                selectedCategories.includes(category) 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-text-prim group-hover:text-blue-600'
              }`}>
                {category}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full transition-all ${
                selectedCategories.includes(category) 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-bg-second text-text-prim'
              }`}>
                {filterCounts[category] || 0}
              </span>
            </label>
          ))
        )}
      </div>

      {hasMore && !searchTerm && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50"
        >
          {showAll ? "Voir moins" : "Voir plus"}
          <FontAwesomeIcon 
            icon={showAll ? faChevronUp : faChevronDown} 
            className="w-3 h-3" 
          />
        </button>
      )}
    </div>
  )
}

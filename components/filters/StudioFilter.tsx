
"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface StudioFilterProps {
  studios: string[]
  selectedStudios: string[]
  onToggleStudio: (studio: string) => void
  filterCounts: Record<string, number>
}

export default function StudioFilter({ 
  studios, 
  selectedStudios, 
  onToggleStudio, 
  filterCounts
}: StudioFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filteredStudios = studios.filter(studio =>
    studio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedStudios = showAll ? filteredStudios : filteredStudios.slice(0, 5)
  const hasMore = filteredStudios.length > 5

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-4 text-text-prim flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Studios / Licenses
      </h3>
      
      <div className="mb-3">
        <input
          type="text"
          placeholder="Rechercher un studio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 text-sm text-text-prim border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
        />
      </div>

      <div className="space-y-3">
        {displayedStudios.length === 0 ? (
          <p className="text-sm text-text-prim italic">
            {studios.length === 0 ? "Aucun studio disponible" : "Aucun studio trouvé"}
          </p>
        ) : (
          displayedStudios.map(studio => (
            <label key={studio} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-green-50 transition-all border-2 border-transparent hover:border-green-200">
              <input
                type="checkbox"
                onChange={() => onToggleStudio(studio)}
                checked={selectedStudios.includes(studio)}
                className="mr-3 w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
              />
              <span className={`text-sm transition-all flex-1 ${
                selectedStudios.includes(studio) 
                  ? 'text-green-600 font-semibold' 
                  : 'text-text-prim group-hover:text-green-600'
              }`}>
                {studio}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full transition-all ${
                selectedStudios.includes(studio) 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-bg-second text-text-prim'
              }`}>
                {filterCounts[studio] || 0}
              </span>
            </label>
          ))
        )}
      </div>

      {hasMore && !searchTerm && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-green-600 hover:text-green-800 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50"
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

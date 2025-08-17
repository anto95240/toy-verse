
"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp, faClose } from "@fortawesome/free-solid-svg-icons"

interface StudioFilterProps {
  studios: string[]
  selectedStudios: string[]
  onToggleStudio: (studio: string) => void
  filterCounts: Record<string, number>
  onClose?: () => void
}

export default function StudioFilter({ 
  studios, 
  selectedStudios, 
  onToggleStudio, 
  filterCounts,
  onClose
}: StudioFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filteredStudios = studios.filter(studio =>
    studio.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedStudios = showAll ? filteredStudios : filteredStudios.slice(0, 5)
  const hasMore = filteredStudios.length > 5

  return (
    <div className="mb-6">
      {/* Titre + croix au même niveau */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Studios / Licenses</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-primary hover:text-gray-700 text-lg flex items-center justify-center"
            aria-label="Fermer"
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        )}
      </div>
      
      {/* Barre de recherche des studios */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Rechercher un studio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm text-[#1c2c42] border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Liste des studios */}
      <div className="space-y-2">
        {displayedStudios.length === 0 ? (
          <p className="text-sm text-text-prim">
            {studios.length === 0 ? "Aucun studio disponible" : "Aucun studio trouvé"}
          </p>
        ) : (
          displayedStudios.map(studio => (
            <label key={studio} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                onChange={() => onToggleStudio(studio)}
                checked={selectedStudios.includes(studio)}
                className="mr-2 rounded"
              />
              <span className="text-sm group-hover:text-blue-600 transition-colors">
                {studio} ({filterCounts[studio] || 0})
              </span>
            </label>
          ))
        )}
      </div>

      {/* Bouton "Voir plus" */}
      {hasMore && !searchTerm && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
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

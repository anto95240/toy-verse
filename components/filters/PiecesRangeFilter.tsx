"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface PiecesRangeFilterProps {
  selectedRange: string
  filterCounts: Record<string, number>
  onRangeChange: (range: string) => void
}

const PIECES_RANGES = [
  { value: "0-200", label: "0 - 200 pièces" },
  { value: "201-500", label: "201 - 500 pièces" },
  { value: "501-1000", label: "501 - 1000 pièces" },
  { value: "1001-1500", label: "1001 - 1500 pièces" },
  { value: "1501-2000", label: "1501 - 2000 pièces" },
  { value: "", label: "Toutes les tailles" }
]

export default function PiecesRangeFilter({
  selectedRange,
  filterCounts,
  onRangeChange
}: PiecesRangeFilterProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const rangeOptions = PIECES_RANGES;

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-4" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="font-semibold text-text-prim flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Nombre de pièces
        </h3>
        <button
          className="text-text-prim hover:text-green-600 transition-colors p-1"
          aria-label={isCollapsed ? "Fermer le filtre des pièces" : "Ouvrir le filtre des pièces"}
        >
          <FontAwesomeIcon 
            icon={isCollapsed ? faChevronDown : faChevronUp} 
            className="w-4 h-4" 
          />
        </button>
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
        <div>
          {rangeOptions.map(({ value, label }) => (
            <label key={value || 'all'} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-green-50 transition-all border-2 border-transparent hover:border-green-200">
              <input
                type="radio"
                name="nbPiecesRange"
                value={value || ''}
                checked={selectedRange === value}
                onChange={() => onRangeChange(value)}
                className="mr-3 w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
              />
              <span className={`text-sm transition-all flex-1 ${
                selectedRange === value 
                  ? 'text-green-600 font-semibold' 
                  : 'text-text-prim group-hover:text-green-600'
              }`}>
                {label}
              </span>
              {value && (
                <span className={`text-xs px-2 py-1 rounded-full transition-all ${
                  selectedRange === value 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-bg-second text-text-prim'
                }`}>
                  {filterCounts[value] || 0}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
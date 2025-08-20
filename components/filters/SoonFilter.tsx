"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface SoonFilterProps {
  selectedValue: boolean | null
  filterCounts: Record<string, number>
  onValueChange: (value: boolean | null) => void
}

const SOON_OPTIONS = [
  { value: true, label: "Prochainement" },
  { value: null, label: "Tous les états" }
]

export default function SoonFilter({
  selectedValue,
  onValueChange,
  filterCounts
}: SoonFilterProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-4" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="font-semibold text-text-prim flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Disponibilité
        </h3>
        <button
          className="text-text-prim hover:text-red-600 transition-colors p-1"
          aria-label={isCollapsed ? "Fermer le filtre de disponibilité" : "Ouvrir le filtre de disponibilité"}
        >
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronDown : faChevronUp}
            className="w-4 h-4"
          />
        </button>
      </div>
      {!isCollapsed && (
        <div>
          {SOON_OPTIONS.map(({ value, label }) => (
            <label key={String(value)} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-red-50 transition-all border-2 border-transparent hover:border-red-200">
              <input
                type="radio"
                name="soon"
                onChange={() => onValueChange(value)}
                checked={selectedValue === value}
                className="mr-3 w-4 h-4 text-red-600 border-2 border-gray-300 focus:ring-red-500"
              />
              <span className={`text-sm transition-all flex-1 ${
                selectedValue === value
                  ? 'text-red-600 font-semibold'
                  : 'text-text-prim group-hover:text-red-600'
              }`}>
                {label}
              </span>
              {value !== null && (
                <span className={`text-xs px-2 py-1 rounded-full transition-all ${
                  selectedValue === value
                    ? 'bg-red-100 text-red-700'
                    : 'bg-bg-second text-text-prim'
                }`}>
                  {filterCounts[String(value)] || 0}
                </span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
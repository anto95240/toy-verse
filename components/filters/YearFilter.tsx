"use client"

import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface YearFilterProps {
  releaseYears: string
  selectedYear: string
  onYearChange: (year: string) => void
  filterCounts: Record<string, number>
  isMobile?: boolean
}

export default function YearFilter({
  releaseYears,
  selectedYear,
  onYearChange,
  filterCounts,
  isMobile = false
}: YearFilterProps) {
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <div className="pb-2">
      <div className="flex items-center justify-between mb-4" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3 className="font-semibold text-text-prim flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          Année de sortie
        </h3>
        <button
          className="text-text-prim hover:text-purple-600 transition-colors p-1"
          aria-label={isCollapsed ? "Fermer le filtre des années" : "Ouvrir le filtre des années"}
        >
          <FontAwesomeIcon 
            icon={isCollapsed ? faChevronDown : faChevronUp} 
            className="w-4 h-4" 
          />
        </button>
      </div>

      <div className={`max-h-48 overflow-y-auto ${isCollapsed ? 'hidden' : ''}`}>
        <label className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-third/30 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="releaseYear"
              value=""
              checked={selectedYear === ''}
              onChange={() => onYearChange('')}
              className="w-4 h-4 text-purple-500 border-border-color focus:ring-purple-500 focus:ring-2 bg-bg-second"
            />
            <span className="text-text-prim group-hover:text-purple-400 transition-colors">
              Toutes les années
            </span>
          </div>
          <span className="text-xs text-text-second bg-bg-second px-2 py-1 rounded-full">
            {filterCounts[''] || 0}
          </span>
        </label>

        {releaseYears.map((year) => (
          <label
            key={year}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-third/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="releaseYear"
                value={year}
                checked={selectedYear === year}
                onChange={() => onYearChange(year)}
                className="w-4 h-4 text-purple-500 border-border-color focus:ring-purple-500 focus:ring-2 bg-bg-second"
              />
              <span className="text-text-prim group-hover:text-purple-400 transition-colors">
                {year}
              </span>
            </div>
            <span className="text-xs text-text-second bg-bg-second px-2 py-1 rounded-full">
              {filterCounts[year] || 0}
            </span>
          </label>
        ))}
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}>
        <div>
          {releaseYears.map(({ value, label }) => (
            <label key={value || 'all'} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-green-50 transition-all border-2 border-transparent hover:border-green-200">
              <input
                type="radio"
                name="releaseYear"
                value={value || ''}
                checked={selectedYear === value}
                onChange={() => onYearChange(value)}
                className="mr-3 w-4 h-4 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
              />
              <span className={`text-sm transition-all flex-1 ${
                releaseYears === value 
                  ? 'text-green-600 font-semibold' 
                  : 'text-text-prim group-hover:text-green-600'
              }`}>
                {label}
              </span>
              {value && (
                <span className={`text-xs px-2 py-1 rounded-full transition-all ${
                  selectedYear === value 
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
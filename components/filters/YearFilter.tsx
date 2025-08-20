
import React from 'react'

interface YearFilterProps {
  releaseYears: string[]
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
  return (
    <div className={`mb-6 ${isMobile ? 'px-4' : ''}`}>
      <h3 className="text-lg font-semibold text-text-prim mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
        Année de sortie
      </h3>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
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
    </div>
  )
}

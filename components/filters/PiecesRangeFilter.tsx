import React from "react"

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
  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-6 text-lg flex items-center">
        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-3 pulse-glow"></div>
        Nombre de pièces
      </h3>
      <div className="space-y-3">
        {PIECES_RANGES.map(({ value, label }) => (
          <label key={value} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-green-50/5 transition-all duration-200">
            <div className="relative mr-3">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => onRangeChange(value)} 
                checked={selectedRange === value}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                selectedRange === value 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500' 
                  : 'border-gray-400 hover:border-green-400'
              }`}>
                {selectedRange === value && (
                  <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                )}
              </div>
            </div>
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
  )
}
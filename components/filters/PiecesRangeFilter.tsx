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
    <div className="mb-6">
      <h3 className="font-medium mb-3">Nombre de pièces</h3>
      <div className="space-y-2">
        {PIECES_RANGES.map(({ value, label }) => (
          <label key={value} className="flex items-center cursor-pointer group">
            <input 
              type="radio" 
              name="nb_pieces" 
              onChange={() => onRangeChange(value)} 
              checked={selectedRange === value}
              className="mr-2"
            />
            <span className="text-sm group-hover:text-blue-600 transition-colors">
              {label} {value && `(${filterCounts[value] || 0})`}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
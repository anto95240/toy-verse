import React from "react"

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
  filterCounts,
  onValueChange
}: SoonFilterProps) {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">État de nouveauté</h3>
      <div className="space-y-2">
        {SOON_OPTIONS.map(({ value, label }) => (
          <label key={String(value)} className="flex items-center cursor-pointer group">
            <input 
              type="radio" 
              name="soon" 
              onChange={() => onValueChange(value)} 
              checked={selectedValue === value}
              className="mr-2"
            />
            <span className="text-sm group-hover:text-blue-600 transition-colors">
              {label} {value !== null && `(${filterCounts[String(value)] || 0})`}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
import React from "react"

interface ExposureFilterProps {
  selectedValue: boolean | null
  filterCounts: Record<string, number>
  onValueChange: (value: boolean | null) => void
}

const EXPOSURE_OPTIONS = [
  { value: true, label: "En exposition" },
  { value: false, label: "Non exposé" },
  { value: null, label: "Tous les états" }
]

export default function ExposureFilter({
  selectedValue,
  filterCounts,
  onValueChange
}: ExposureFilterProps) {
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">État d&apos;exposition</h3>
      <div className="space-y-2">
        {EXPOSURE_OPTIONS.map(({ value, label }) => (
          <label key={String(value)} className="flex items-center cursor-pointer group">
            <input 
              type="radio" 
              name="expose" 
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
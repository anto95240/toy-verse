
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
    <div className="mb-8">
      <h3 className="font-semibold mb-4 text-text-prim flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
        État d&apos;exposition
      </h3>
      <div className="space-y-3">
        {EXPOSURE_OPTIONS.map(({ value, label }) => (
          <label key={String(value)} className="flex items-center cursor-pointer group p-3 rounded-xl hover:bg-orange-50 transition-all border-2 border-transparent hover:border-orange-200">
            <input 
              type="radio" 
              name="expose" 
              onChange={() => onValueChange(value)} 
              checked={selectedValue === value}
              className="mr-3 w-4 h-4 text-orange-600 border-2 border-gray-300 focus:ring-orange-500"
            />
            <span className={`text-sm transition-all flex-1 ${
              selectedValue === value 
                ? 'text-orange-600 font-semibold' 
                : 'text-text-prim group-hover:text-orange-600'
            }`}>
              {label}
            </span>
            {value !== null && (
              <span className={`text-xs px-2 py-1 rounded-full transition-all ${
                selectedValue === value 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-bg-second text-text-prim'
              }`}>
                {filterCounts[String(value)] || 0}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}


import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface SingleSelectFilterProps {
  title: string
  colorScheme: 'blue' | 'green' | 'purple' | 'indigo' | 'orange' | 'red'
  options: { value: string | number, label: string }[]
  selectedValue: string | number
  onValueChange: (value: string) => void
  filterCounts: Record<string, number>
  isCollapsed: boolean
  onToggleCollapse: () => void
  icon: IconDefinition
}

const colorClasses = {
  blue: {
    header: 'bg-blue-50 border-blue-200',
    headerText: 'text-blue-800',
    item: '',
    selected: '',
    count: 'text-blue-600'
  },
  green: {
    header: 'bg-green-50 border-green-200',
    headerText: 'text-green-800',
    item: '',
    selected: '',
    count: 'text-green-600'
  },
  purple: {
    header: 'bg-purple-50 border-purple-200',
    headerText: 'text-purple-800',
    item: '',
    selected: '',
    count: 'text-purple-600'
  },
  indigo: {
    header: 'bg-indigo-50 border-indigo-200',
    headerText: 'text-indigo-800',
    item: '',
    selected: '',
    count: 'text-indigo-600'
  },
  orange: {
    header: 'bg-orange-50 border-orange-200',
    headerText: 'text-orange-800',
    item: '',
    selected: '',
    count: 'text-orange-600'
  },
  red: {
    header: 'bg-red-50 border-red-200',
    headerText: 'text-red-800',
    item: '',
    selected: '',
    count: 'text-red-600'
  }
}

export default function SingleSelectFilter({
  title,
  colorScheme,
  options,
  selectedValue,
  onValueChange,
  filterCounts,
  isCollapsed,
  onToggleCollapse,
  icon
}: SingleSelectFilterProps) {
  const colors = colorClasses[colorScheme]
  const hasSelection = selectedValue !== '' && selectedValue !== null && selectedValue !== undefined

  return (
    <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggleCollapse}
        className={`w-full px-4 py-3 flex items-center justify-between ${colors.header} ${colors.headerText} font-semibold text-sm hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
          <span>{title}</span>
          {hasSelection && (
            <span className={`px-2 py-1 bg-bg-second rounded-full text-xs ${colors.count}`}>
              1
            </span>
          )}
        </div>
        <FontAwesomeIcon 
          icon={isCollapsed ? faChevronDown : faChevronUp} 
          className="w-3 h-3" 
        />
      </button>

      {!isCollapsed && (
        <div className="p-4 bg-bg-second">
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedValue.toString() === option.value.toString()
              
              const countKey = option.value.toString()
              const count = filterCounts[countKey] || 0
              
              return (
                <label
                  key={option.value || 'null'}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? `${colors.selected} border` 
                      : `${colors.item} border border-transparent`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`${title}-filter`}
                      checked={isSelected}
                      onChange={() => onValueChange(option.value.toString())}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-text-prim">{option.label}</span>
                  </div>
                  {count > 0 && (
                    <span className={`text-xs ${colors.count} font-medium px-2 py-1 bg-gray-100 rounded-full`}>
                      {count}
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

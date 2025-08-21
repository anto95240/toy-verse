
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faSearch } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface MultiSelectFilterProps {
  title: string
  colorScheme: 'blue' | 'green' | 'purple' | 'indigo' | 'orange' | 'red'
  items: string[]
  selectedItems: string[]
  onToggleItem: (item: string) => void
  filterCounts: Record<string, number>
  searchable?: boolean
  maxDisplayed?: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  icon: IconDefinition
}

const colorClasses = {
  blue: {
    header: 'bg-blue-50 border-blue-200',
    headerText: 'text-blue-800',
    item: '',
    selected: 'text-blue-800 border-blue-200',
    count: 'text-blue-600'
  },
  green: {
    header: 'bg-green-50 border-green-200',
    headerText: 'text-green-800',
    item: '',
    selected: 'text-green-800 border-green-200',
    count: 'text-green-600'
  },
  purple: {
    header: 'bg-purple-50 border-purple-200',
    headerText: 'text-purple-800',
    item: '',
    selected: 'text-purple-800 border-purple-200',
    count: 'text-purple-600'
  },
  indigo: {
    header: 'bg-indigo-50 border-indigo-200',
    headerText: 'text-indigo-800',
    item: '',
    selected: 'text-indigo-800 border-indigo-200',
    count: 'text-indigo-600'
  },
  orange: {
    header: 'bg-orange-50 border-orange-200',
    headerText: 'text-orange-800',
    item: '',
    selected: 'text-orange-800 border-orange-200',
    count: 'text-orange-600'
  },
  red: {
    header: 'bg-red-50 border-red-200',
    headerText: 'text-red-800',
    item: '',
    selected: 'text-red-800 border-red-200',
    count: 'text-red-600'
  }
}

export default function MultiSelectFilter({
  title,
  colorScheme,
  items,
  selectedItems,
  onToggleItem,
  filterCounts,
  searchable = false,
  maxDisplayed = 5,
  isCollapsed,
  onToggleCollapse,
  icon
}: MultiSelectFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)
  
  const colors = colorClasses[colorScheme]
  
  const filteredItems = searchable 
    ? items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
    : items
    
  const displayedItems = showAll ? filteredItems : filteredItems.slice(0, maxDisplayed)
  const hasMore = filteredItems.length > maxDisplayed

  return (
    <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggleCollapse}
        className={`w-full px-4 py-3 flex items-center justify-between ${colors.header} ${colors.headerText} font-semibold text-sm hover:opacity-80 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={icon} className="w-4 h-4" />
          <span>{title}</span>
          {selectedItems.length > 0 && (
            <span className={`px-2 py-1 bg-bg-second rounded-full text-xs ${colors.count}`}>
              {selectedItems.length}
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
          {searchable && (
            <div className="relative mb-3">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2d3748] w-4 h-4" 
              />
              <input
                type="text"
                placeholder={`Rechercher dans ${title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border text-[#2d3748] border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="space-y-2">
            {displayedItems.map(item => {
              const isSelected = selectedItems.includes(item)
              const count = filterCounts[item] || 0
              
              return (
                <label
                  key={item}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? `${colors.selected} border` 
                      : `${colors.item} border border-transparent`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleItem(item)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-text-prim">{item}</span>
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

          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAll ? 'Voir moins' : `Voir ${filteredItems.length - maxDisplayed} de plus`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

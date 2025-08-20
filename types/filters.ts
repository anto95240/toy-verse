
export interface FilterCounts {
  categories: Record<string, number>
  studios: Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed: Record<string, number>
  soon: Record<string, number>
  releaseYears: Record<string, number>
  totalToys?: number
}

export interface Filters {
  categories: string[]
  studios: string[]
  nbPiecesRange: string
  isExposed: boolean | null
  isSoon: boolean | null
  releaseYear: string
}

export interface FilterSidebarProps {
  categories: string[]
  studios: string[]
  releaseYears: string[]
  filters: Filters
  filterCounts: FilterCounts
  onToggleCategory: (category: string) => void
  onToggleStudio: (studio: string) => void
  onNbPiecesChange: (range: string) => void
  onExposedChange: (value: boolean | null) => void
  onSoonChange: (value: boolean | null) => void
  onReleaseYearChange: (year: string) => void
  onResetFilters: () => void
  onClearSearch?: () => void
  isSearchActive?: boolean
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

export interface FilterContentProps extends Omit<FilterSidebarProps, 'className'> {}

// Interface générique pour tous les filtres
export interface BaseFilterProps {
  title: string
  icon: string
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// Interface pour les filtres de sélection multiple (categories, studios)
export interface MultiSelectFilterProps extends BaseFilterProps {
  items: string[]
  selectedItems: string[]
  onToggleItem: (item: string) => void
  filterCounts: Record<string, number>
  searchable?: boolean
  maxDisplayed?: number
}

// Interface pour les filtres de sélection simple (year, pieces range)
export interface SingleSelectFilterProps extends BaseFilterProps {
  options: Array<{ value: string; label: string }>
  selectedValue: string
  onValueChange: (value: string) => void
  filterCounts: Record<string, number>
}

// Interface pour les filtres booléens (exposed, soon)
export interface BooleanFilterProps extends BaseFilterProps {
  options: Array<{ value: boolean | null; label: string }>
  selectedValue: boolean | null
  onValueChange: (value: boolean | null) => void
  filterCounts: Record<string, number>
}

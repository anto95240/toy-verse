export interface FilterCounts {
  categories: Record<string, number>
  studios: Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed: Record<string, number>
  soon: Record<string, number>
}

export interface Filters {
  categories: string[]
  studios: string[]
  nbPiecesRange: string
  isExposed: boolean | null
  isSoon: boolean | null
}

export interface FilterSidebarProps {
  categories: string[]
  studios: string[]
  filters: Filters
  filterCounts: FilterCounts
  onToggleCategory: (category: string) => void
  onToggleStudio: (studio: string) => void
  onNbPiecesChange: (range: string) => void
  onExposedChange: (value: boolean | null) => void
  onSoonChange: (value: boolean | null) => void
  onResetFilters: () => void
  onClearSearch?: () => void
  isSearchActive?: boolean
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

export interface FilterContentProps extends Omit<FilterSidebarProps, 'className'> {}
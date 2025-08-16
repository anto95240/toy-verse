import type { Toy } from "@/types/theme"

export interface ToyGridProps {
  toys: Toy[]
  toyImageUrls: Record<string, string | null>
  onEditToy: (toy: Toy) => void
  onDeleteToy: (toyId: string) => void
  searchResults?: (Toy & { theme_name: string })[]
  isSearchActive?: boolean
  onClearSearch?: () => void
  currentThemeName?: string
  currentUserId?: string
}

export interface ToyImageProps {
  toy: Toy
  toyImageUrls: Record<string, string | null>
  currentUserId?: string
}

export interface ToyCardProps {
  toy: Toy & { theme_name?: string }
  toyImageUrls: Record<string, string | null>
  currentUserId?: string
  onEditToy: (toy: Toy) => void
  onDeleteToy: (toyId: string) => void
  isFromDifferentTheme?: boolean
}

export interface ThemeBannerProps {
  isFromDifferentTheme: boolean
  themeName?: string
  onClearSearch?: () => void
}

export interface EmptyStateProps {
  isSearchActive: boolean
  onClearSearch?: () => void
}
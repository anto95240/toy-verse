import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSlug } from "@/lib/slugUtils"
import type { Theme, Toy } from "@/types/theme"

export function useHomeLogic(initialThemes: Theme[]) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Gestion action URL (?action=add)
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsModalOpen(true)
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('action')
      router.replace(`/home?${newParams.toString()}`, { scroll: false })
    }
  }, [searchParams, router])

  const handleSearchResults = (results: (Toy & { theme_name: string })[]) => {
    setSearchResults(results)
    setIsSearching(results.length > 0)
  }

  const navigateToToy = (toy: Toy & { theme_name: string }) => {
    const themeSlug = createSlug(toy.theme_name)
    router.push(`/${themeSlug}?search=${encodeURIComponent(toy.nom)}`)
  }

  const navigateToTheme = (theme: Theme) => {
    router.push(`/${createSlug(theme.name)}`)
  }

  const addTheme = (newTheme: Theme) => {
    setThemes(prev => [...prev, newTheme])
    setIsModalOpen(false)
    router.refresh()
  }

  const updateTheme = (updatedTheme: Theme) => {
    setThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t))
    router.refresh()
  }

  return {
    themes,
    searchResults,
    isSearching,
    isModalOpen, setIsModalOpen,
    handleSearchResults,
    navigateToToy,
    navigateToTheme,
    addTheme,
    updateTheme
  }
}
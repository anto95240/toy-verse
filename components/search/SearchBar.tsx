"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme"
import { useRouter, usePathname } from "next/navigation"
import { createSlug } from "@/lib/slugUtils"

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearchResults?: (results: (Toy & { theme_name: string })[]) => void
  showDropdown?: boolean
  themeId?: string
  isGlobal?: boolean
}

interface ToyWithTheme extends Toy {
  themes?: {
    name: string
  }[] | null
}

export default function SearchBar({
  placeholder = "Rechercher un jouet...",
  className = "",
  onSearchResults,
  showDropdown = true,
  themeId,
  isGlobal = false,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const onSearchResultsRef = useRef(onSearchResults)

  const supabase = getSupabaseClient()
  const router = useRouter()
  // const pathname = usePathname()

  useEffect(() => {
    onSearchResultsRef.current = onSearchResults
  }, [onSearchResults])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const extractThemeName = (toy: ToyWithTheme): string => {
    const t = toy.themes
    if (!t) return ""
    if (Array.isArray(t)) return t[0]?.name ?? ""
    return (t as { name: string }).name ?? ""
  }

  const fetchToys = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([])
        onSearchResultsRef.current?.([])
        return
      }

      setIsLoading(true)
      try {
        const likeTerm = `%${term}%`
        const shouldLimitToTheme = themeId && isGlobal === true

        const selectFields = `
          id, nom, numero, nb_pieces, taille, categorie, 
          is_exposed, is_soon, theme_id, photo_url, created_at,
          themes!inner(name)
        `

        let toysByName = supabase
          .from("toys")
          .select(selectFields)
          .ilike("nom", likeTerm)

        if (shouldLimitToTheme) {
          toysByName = toysByName.eq("theme_id", themeId)
        }

        let toysByTheme = supabase
          .from("toys")
          .select(selectFields)
          .ilike("themes.name", likeTerm)

        if (shouldLimitToTheme) {
          toysByTheme = toysByTheme.eq("theme_id", themeId)
        }

        const [nameResults, themeResults] = await Promise.all([
          toysByName,
          toysByTheme
        ])

        if (nameResults.error) throw nameResults.error
        if (themeResults.error) throw themeResults.error

        const combinedResults = [
          ...(nameResults.data || []),
          ...(themeResults.data || [])
        ] as ToyWithTheme[]

        const uniqueResults = combinedResults.filter((toy, index, self) =>
          index === self.findIndex(t => t.id === toy.id)
        )

        const sortedResults = uniqueResults.sort((a, b) => {
          if (themeId) {
            const aIsCurrentTheme = a.theme_id === themeId ? 1 : 0
            const bIsCurrentTheme = b.theme_id === themeId ? 1 : 0
            return bIsCurrentTheme - aIsCurrentTheme
          }
          return 0
        })

        const transformedData = sortedResults.map((toy: ToyWithTheme) => ({
          ...toy,
          theme_name: toy.themes?.[0]?.name ?? ""
        }))

        setSearchResults(transformedData)
        onSearchResultsRef.current?.(transformedData)
      } catch (err) {
        console.error("Erreur recherche jouets:", err)
        setSearchResults([])
        onSearchResultsRef.current?.([])
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, themeId, isGlobal]
  )

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      onSearchResultsRef.current?.([])
      return
    }

    const timeout = setTimeout(() => {
      fetchToys(searchTerm)
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchTerm, fetchToys])

  const handleToyClick = useCallback(
    async (toy: Toy & { theme_name: string }) => {
      setSearchTerm(toy.nom)
      setShowResults(false)
      setIsFocused(false)

      // 🔒 On NAVIGUE TOUJOURS, même si c’est le même thème
      let themeSlug = createSlug(toy.theme_name?.trim() || "")

      // 🛟 Fallback : si theme_name est vide, on recharge le nom du thème via theme_id
      if (!themeSlug && toy.theme_id) {
        const { data, error } = await supabase
          .from("themes")
          .select("name")
          .eq("id", toy.theme_id)
          .single()

        if (!error && data?.name) {
          themeSlug = createSlug(data.name)
        }
      }

      if (!themeSlug) {
        console.warn("Impossible de déterminer le slug du thème pour le jouet :", toy)
        return
      }

      // 🧭 Routing : si ta page thème est /[slug], garde ceci.
      // Si c’est /themes/[slug], change en `/themes/${themeSlug}`
      router.push(`/${themeSlug}`)
    },
    [router, supabase]
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim()) setShowResults(true)
  }, [])

  const handleInputFocus = useCallback(() => {
    if (searchTerm.trim()) setShowResults(true)
    setIsFocused(true)
  }, [searchTerm])

  const handleInputBlur = useCallback(() => {
    setTimeout(() => setIsFocused(false), 200)
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => e.preventDefault(), [])

  const dropdownContent = useMemo(() => {
    if (isLoading) return <div className="p-3 text-gray-500 text-sm">Recherche...</div>
    if (searchResults.length === 0) return <div className="p-3 text-gray-500 text-sm">Aucun jouet trouvé</div>

    return (
      <div className="py-2">
        {searchResults.map((toy) => (
          <button
            key={toy.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToyClick(toy)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
              toy.theme_id === themeId ? 'border-l-2 border-blue-400' : ''
            }`}
          >
            <div className="font-medium text-text-prim">{toy.nom}</div>
            <div className="text-sm text-gray-500 flex items-center justify-between">
              <span>{toy.theme_name} • {toy.categorie || "Sans catégorie"}</span>
              {toy.theme_id !== themeId && (
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  Autre thème
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    )
  }, [isLoading, searchResults, handleToyClick, themeId])

  const shouldShowDropdown = showDropdown && showResults && searchTerm.trim().length > 0

  return (
    <div ref={searchRef} className={`relative ${className} ${isFocused && isGlobal ? 'search-results-container' : ''}`}>
      <form className="flex" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className="bg-bg-second text-blue-600 px-4 w-24 rounded-r-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "..." : "Chercher"}
        </button>
      </form>

      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 bg-bg-second border border-border-color rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {dropdownContent}
        </div>
      )}
    </div>
  )
}
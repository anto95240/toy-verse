"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme"
import { useRouter } from "next/navigation"
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
          themes(name)
        `

        // Recherche par nom de jouet
        let toysByName = supabase
          .from("toys")
          .select(selectFields)
          .ilike("nom", likeTerm)

        if (shouldLimitToTheme) {
          toysByName = toysByName.eq("theme_id", themeId)
        }

        // Recherche par numéro
        let toysByNumber = supabase
          .from("toys")
          .select(selectFields)
          .ilike("numero", likeTerm)

        if (shouldLimitToTheme) {
          toysByNumber = toysByNumber.eq("theme_id", themeId)
        }

        // Exécuter les deux recherches en parallèle
        const [nameResults, numberResults] = await Promise.all([
          toysByName,
          toysByNumber
        ])

        if (nameResults.error) throw nameResults.error
        if (numberResults.error) throw numberResults.error

        // Combiner les résultats en évitant les doublons
        const nameData = nameResults.data || []
        const numberData = numberResults.data || []

        const combinedResults = [...nameData]
        numberData.forEach(toy => {
          if (!nameData.some(nameToy => nameToy.id === toy.id)) {
            combinedResults.push(toy)
          }
        })

        const results = combinedResults as ToyWithTheme[]

        const sortedResults = results.sort((a, b) => {
          if (themeId) {
            const aIsCurrentTheme = a.theme_id === themeId ? 1 : 0
            const bIsCurrentTheme = b.theme_id === themeId ? 1 : 0
            return bIsCurrentTheme - aIsCurrentTheme
          }
          return 0
        })

        const transformedData = await Promise.all(
          sortedResults.map(async (toy: ToyWithTheme) => {
            let themeName = toy.themes?.[0]?.name

            // fallback si la relation themes est vide
            if (!themeName && toy.theme_id) {
              const { data, error } = await supabase
                .from("themes")
                .select("name")
                .eq("id", toy.theme_id)
                .single()
              if (!error && data?.name) themeName = data.name
            }

            return {
              ...toy,
              theme_name: themeName ?? "Sans thème"
            }
          })
        )

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

      // Si le jouet appartient au thème actuel, on reste sur la même page
      if (toy.theme_id === themeId) {
        onSearchResultsRef.current?.([toy])
        return
      }

      // Sinon, on navigue vers le thème du jouet
      let themeSlug = createSlug(toy.theme_name?.trim() || "")

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

      // Nettoyer la recherche avant de naviguer
      onSearchResultsRef.current?.([])
      setSearchResults([])
      setSearchTerm("")

      router.push(`/${themeSlug}`)
    },
    [router, supabase, themeId]
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
            <div className="font-semibold text-text-prim">{toy.nom}</div>
            <div className="text-sm text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="font-medium text-blue-400 px-2 py-1 bg-blue-50 rounded-lg">{toy.theme_name}</span>
                {toy.numero && <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg">N°{toy.numero}</span>}
                <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg">{toy.categorie || "Sans catégorie"}</span>
              </span>
              {toy.theme_id !== themeId && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
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
          className={`flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-300`}
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
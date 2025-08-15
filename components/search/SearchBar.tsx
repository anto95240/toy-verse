
"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme"
import { useRouter, usePathname } from "next/navigation"

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearchResults?: (results: (Toy & { theme_name: string })[]) => void
  showDropdown?: boolean
  themeId?: string
}

export default function SearchBar({
  placeholder = "Rechercher un jouet...",
  className = "",
  onSearchResults,
  showDropdown = true,
  themeId,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const supabase = getSupabaseClient()
  const router = useRouter()
  const pathname = usePathname()

  // Fermer dropdown si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchToys = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([])
        if (onSearchResults) onSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        let query = supabase.from("toys_with_theme").select("*")
        if (themeId) query = query.eq("theme_id", themeId)

        const likeTerm = `%${term}%`
        query = query.or(`nom.ilike.${likeTerm},theme_name.ilike.${likeTerm}`)

        const { data, error } = await query
        if (error) throw error

        setSearchResults(data || [])
        if (onSearchResults) onSearchResults(data || [])
      } catch (err) {
        console.error("Erreur recherche jouets:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, themeId, onSearchResults]
  )

  // Debounce search avec useCallback pour éviter les re-créations
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      if (onSearchResults) onSearchResults([])
      return
    }
    
    const timeout = setTimeout(() => fetchToys(searchTerm), 300)
    return () => clearTimeout(timeout)
  }, [searchTerm, fetchToys])

  const handleToyClick = useCallback((toy: Toy & { theme_name: string }) => {
    setSearchTerm(toy.nom)
    setShowResults(false)
    if (pathname !== `/theme/${toy.theme_id}`) router.push(`/theme/${toy.theme_id}`)
  }, [pathname, router])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (e.target.value.trim()) {
      setShowResults(true)
    }
  }, [])

  const handleInputFocus = useCallback(() => {
    if (searchTerm.trim()) {
      setShowResults(true)
    }
  }, [searchTerm])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
  }, [])

  // Mémoriser le contenu du dropdown pour éviter les re-rendus
  const dropdownContent = useMemo(() => {
    if (isLoading) {
      return <div className="p-3 text-gray-500 text-sm">Recherche...</div>
    }
    
    if (searchResults.length === 0) {
      return <div className="p-3 text-gray-500 text-sm">Aucun jouet trouvé</div>
    }
    
    return (
      <div className="py-2">
        {searchResults.map((toy) => (
          <button
            key={toy.id}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToyClick(toy)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="font-medium text-gray-900">{toy.nom}</div>
            <div className="text-sm text-gray-500">
              {toy.theme_name} • {toy.categorie || "Sans catégorie"}
            </div>
          </button>
        ))}
      </div>
    )
  }, [isLoading, searchResults, handleToyClick])

  // Condition stable pour l'affichage du dropdown
  const shouldShowDropdown = showDropdown && showResults && searchTerm.trim().length > 0

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form className="flex" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className="bg-white text-blue-600 px-4 w-24 rounded-r-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "..." : "Chercher"}
        </button>
      </form>

      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {dropdownContent}
        </div>
      )}
    </div>
  )
}
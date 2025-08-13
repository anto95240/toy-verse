'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export default function SearchBar({ placeholder = "Rechercher un jouet...", className = "" }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()
  const router = useRouter()

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsLoading(true)
        try {
          const { data, error } = await supabase
            .from('toys')
            .select(`
              *,
              themes!inner(name)
            `)
            .ilike('nom', `${searchTerm}%`)
            .limit(10)

          if (error) {
            console.error('Erreur recherche:', error)
            setSearchResults([])
          } else {
            const formattedResults = data?.map(toy => ({
              ...toy,
              theme_name: (toy.themes as any).name
            })) || []
            setSearchResults(formattedResults)
            setShowResults(true)
          }
        } catch (err) {
          console.error('Erreur recherche:', err)
          setSearchResults([])
        }
        setIsLoading(false)
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, supabase])

  const handleToyClick = (toy: Toy & { theme_name: string }) => {
    router.push(`/theme/${toy.theme_id}`)
    setShowResults(false)
    setSearchTerm('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Optionnel: rediriger vers une page de résultats
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow rounded-l-md px-3 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
        />
        <button
          type="submit"
          disabled={!searchTerm.trim()}
          className="bg-white text-blue-600 px-4 rounded-r-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '...' : 'Chercher'}
        </button>
      </form>

      {/* Résultats de recherche */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-3 text-gray-500 text-sm">
              {isLoading ? 'Recherche...' : 'Aucun jouet trouvé'}
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((toy) => (
                <button
                  key={toy.id}
                  onClick={() => handleToyClick(toy)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">{toy.nom}</div>
                  <div className="text-sm text-gray-500">
                    {toy.theme_name} • {toy.categorie || 'Sans catégorie'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
import { useState, useEffect, useRef } from "react"
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from "@/types/theme"

type ToyWithTheme = Toy & { theme_name: string }

export function useSearch(onResults: (results: ToyWithTheme[]) => void) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<ToyWithTheme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const supabase = getSupabaseClient()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fermeture clic extérieur
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", clickOutside)
    return () => document.removeEventListener("mousedown", clickOutside)
  }, [])

  // Recherche (Debounce)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]); setShowDropdown(false); if (!query) onResults([])
        return
      }
      setIsLoading(true)
      const { data } = await supabase.from('toys').select('*, themes(name)')
        .or(`nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`)
        .limit(5)
      
      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSuggestions(data.map((t: any) => ({ ...t, theme_name: t.themes?.name || "Inconnu" })))
        setShowDropdown(true)
      }
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, supabase, onResults])

  const selectToy = (toy: ToyWithTheme) => {
    setQuery(toy.nom); setShowDropdown(false); onResults([toy])
  }

  const viewAll = async () => {
    setShowDropdown(false); setIsLoading(true)
    const { data } = await supabase.from('toys').select('*, themes(name)')
      .or(`nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data) onResults(data.map((t: any) => ({ ...t, theme_name: t.themes?.name || "Inconnu" })))
    setIsLoading(false)
  }

  const clear = () => { setQuery(""); setSuggestions([]); setShowDropdown(false); onResults([]); inputRef.current?.focus() }

  return {
    query, setQuery, suggestions, isLoading, showDropdown,
    inputRef, dropdownRef,
    selectToy, viewAll, clear
  }
}
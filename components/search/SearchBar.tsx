"use client"

import { useState, useEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faTimes, faSpinner, faChevronRight, faCube } from "@fortawesome/free-solid-svg-icons"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme" //

// Type étendu pour inclure le nom du thème
type ToyWithTheme = Toy & { theme_name: string }

interface SearchBarProps {
  onResults: (results: ToyWithTheme[]) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({ 
  onResults, 
  placeholder = "Rechercher par nom, numéro, catégorie...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<ToyWithTheme[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseClient()

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // LOGIQUE DE RECHERCHE (Debounce)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([])
        setShowDropdown(false)
        if (query.length === 0) onResults([])
        return
      }

      setIsLoading(true)
      
      try {
        // --- MODIFICATION ICI : Ajout de numero.ilike ---
        const { data, error } = await supabase
          .from('toys')
          .select('*, themes(name)')
          .or(`nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`) // Recherche Nom OU Catégorie OU Numéro
          .limit(5)

        if (!error && data) {
          const formattedData: ToyWithTheme[] = data.map((item: any) => ({
            ...item,
            theme_name: item.themes?.name || "Thème inconnu"
          }))
          setSuggestions(formattedData)
          setShowDropdown(true)
        }
      } catch (err) {
        console.error("Erreur recherche:", err)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [query, supabase, onResults])

  // --- ACTION 1 : Clic sur un jouet spécifique ---
  const handleSelectToy = (toy: ToyWithTheme) => {
    setQuery(toy.nom)
    setShowDropdown(false)
    onResults([toy])
  }

  // --- ACTION 2 : Clic sur "Voir tous les résultats" ---
  const handleViewAll = async () => {
    setShowDropdown(false)
    setIsLoading(true)
    
    // --- MODIFICATION ICI AUSSI ---
    const { data } = await supabase
      .from('toys')
      .select('*, themes(name)')
      .or(`nom.ilike.%${query}%,categorie.ilike.%${query}%,numero.ilike.%${query}%`)

    if (data) {
      const formattedData: ToyWithTheme[] = data.map((item: any) => ({
        ...item,
        theme_name: item.themes?.name || "Thème inconnu"
      }))
      onResults(formattedData)
    }
    setIsLoading(false)
  }

  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    setShowDropdown(false)
    onResults([])
    inputRef.current?.focus()
  }

  return (
    <div className={`relative w-full ${className} z-50`}>
      {/* Barre de recherche */}
      <div className={`
        relative flex items-center w-full bg-background border-2 rounded-xl transition-all duration-300
        ${isFocused || showDropdown ? "border-primary shadow-lg ring-2 ring-primary/10" : "border-border hover:border-primary/50"}
      `}>
        <div className={`pl-4 ${isLoading ? "text-primary animate-spin" : "text-muted-foreground"}`}>
          <FontAwesomeIcon icon={isLoading ? faSpinner : faSearch} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />

        {query && (
          <button 
            onClick={handleClear} 
            aria-label="réinitialise la recherche"
            className="pr-4 text-muted-foreground hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Dropdown des résultats */}
      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="px-4 py-2 bg-secondary/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Suggestion rapide
          </div>

          <div className="divide-y divide-border/50">
            {suggestions.map((toy) => (
              <div 
                key={toy.id}
                onClick={() => handleSelectToy(toy)}
                className="group flex items-center gap-4 p-3 hover:bg-primary/5 cursor-pointer transition-colors"
              >
                {/* Icône */}
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                   <FontAwesomeIcon icon={faCube} />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {toy.nom}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {/* Affichage du numéro s'il existe */}
                    {toy.numero && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                        #{toy.numero}
                      </span>
                    )}
                    <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                      {toy.theme_name}
                    </span>
                    {toy.categorie && (
                      <span className="truncate">• {toy.categorie}</span>
                    )}
                  </div>
                </div>

                <FontAwesomeIcon icon={faChevronRight} className="text-xs text-muted-foreground/30 group-hover:text-primary transition-colors pr-2" />
              </div>
            ))}
          </div>

          <button 
            onClick={handleViewAll}
            className="w-full p-3 bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-primary text-sm font-medium transition-all text-center flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faSearch} className="text-xs" />
            Voir tous les résultats pour "{query}"
          </button>
        </div>
      )}
    </div>
  )
}
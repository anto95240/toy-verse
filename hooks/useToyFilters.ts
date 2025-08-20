import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import { applyFiltersToQuery, fetchFilterCounts } from '@/utils/filterQueries'
import type { Toy } from '@/types/theme'

interface Filters {
  categories: string[]
  studios: string[]
  nbPiecesRange: string
  isExposed: boolean | null
  isSoon: boolean | null
}

interface FilterCounts {
  categories: Record<string, number>
  studios: Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed: Record<string, number>
  soon: Record<string, number>
  totalToys?: number
}

const initialFilters: Filters = {
  categories: [],
  studios: [],
  nbPiecesRange: '',
  isExposed: null,
  isSoon: null,
  releaseYear: '',
}

export function useToyFilters(themeId: string, sessionExists: boolean) {
  const [toys, setToys] = useState<Toy[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [studios, setStudios] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    categories: {},
    studios: {},
    nbPiecesRanges: {},
    exposed: {},
    soon: {},
    releaseYears: {},
    totalToys: 0
  })

  const supabase = getSupabaseClient()

  // Charger les catégories
  useEffect(() => {
    if (!sessionExists) return

    const loadCategories = () => supabase
      .from('toys')
      .select('categorie')
      .eq('theme_id', themeId)
      .not('categorie', 'is', null)
      .order('categorie', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur chargement catégories:', error)
          setCategories([])
        } else {
          const uniqueCategories = Array.from(new Set(data?.map(c => c.categorie).filter(Boolean) || []))
          setCategories(uniqueCategories)
        }
      })

    loadCategories()

    // Écouter les changements en temps réel pour les catégories
    const subscription = supabase
      .channel('toys-categories')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` },
        () => {
          loadCategories()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionExists, themeId, supabase])

  // Charger les studios
  useEffect(() => {
    if (!sessionExists) return

    const loadStudios = () => supabase
      .from('toys')
      .select('studio')
      .eq('theme_id', themeId)
      .not('studio', 'is', null)
      .order('studio', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur chargement studios:', error)
          setStudios([])
        } else {
          const uniqueStudios = Array.from(new Set(data?.map(s => s.studio).filter(Boolean) || []))
          setStudios(uniqueStudios)
        }
      })

    loadStudios()

    // Écouter les changements en temps réel pour les studios
    const subscription = supabase
      .channel('toys-studios')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` },
        () => {
          loadStudios()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionExists, themeId, supabase])

  // Charger jouets selon filtres
  useEffect(() => {
    if (!sessionExists) return

    let query = supabase
      .from('toys')
      .select('*')
      .eq('theme_id', themeId)

    query = applyFiltersToQuery(query, filters)

    query.then(({ data, error }) => {
      if (error) {
        console.error('Erreur chargement jouets:', error)
        setToys([])
      } else {
        // Tri numérique côté client pour gérer correctement les numéros
        const sortedData = (data || []).sort((a, b) => {
          // Gérer les valeurs nulles/undefined
          if (!a.numero && !b.numero) return 0
          if (!a.numero) return 1  // null/undefined à la fin
          if (!b.numero) return -1

          // Convertir en nombres pour un tri numérique correct
          const numA = parseInt(a.numero.toString(), 10)
          const numB = parseInt(b.numero.toString(), 10)

          // Si l'un des deux n'est pas un nombre valide
          if (isNaN(numA) && isNaN(numB)) return a.numero.localeCompare(b.numero)
          if (isNaN(numA)) return 1
          if (isNaN(numB)) return -1

          return numA - numB
        })
        setToys(sortedData)
      }
    })
  }, [sessionExists, themeId, filters, supabase])

  // Charger les compteurs pour tous les filtres
  useEffect(() => {
    if (!sessionExists) return

    async function loadFilterCounts() {
      try {
        const counts = await fetchFilterCounts(supabase, themeId, categories, studios, filters)
        setFilterCounts(counts)
      } catch (error) {
        console.error('Erreur chargement compteurs:', error)
      }
    }

    loadFilterCounts()
  }, [sessionExists, themeId, categories, studios, filters, supabase])

  const toggleCategory = (cat: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories }
    })
  }

  const toggleStudio = (studio: string) => {
    setFilters(prev => {
      const studios = prev.studios.includes(studio)
        ? prev.studios.filter(s => s !== studio)
        : [...prev.studios, studio]
      return { ...prev, studios }
    })
  }

  const handleNbPiecesChange = (range: string) => {
    setFilters(prev => ({ ...prev, nbPiecesRange: range }))
  }

  const handleExposedChange = (value: boolean | null) => {
    setFilters(prev => ({ ...prev, isExposed: value }))
  }

  const handleSoonChange = (value: boolean | null) => {
    setFilters(prev => ({ ...prev, isSoon: value }))
  }

  const handleReleaseYearChange = (year: string) => {
    setFilters(prev => ({ ...prev, releaseYear: year }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  // Charger les années disponibles
  const [releaseYears, setReleaseYears] = useState<string[]>([])

  useEffect(() => {
    if (!sessionExists) return

    const loadReleaseYears = () => supabase
      .from('toys')
      .select('release_date')
      .eq('theme_id', themeId)
      .not('release_date', 'is', null)
      .order('release_date', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erreur chargement années:', error)
          setReleaseYears([])
        } else {
          const uniqueYears = Array.from(new Set(data?.map(r => r.release_date).filter(Boolean) || []))
          setReleaseYears(uniqueYears)
        }
      })

    loadReleaseYears()

    const subscription = supabase
      .channel('toys-years')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` },
        () => {
          loadReleaseYears()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionExists, themeId, supabase])

  return {
    toys,
    setToys,
    categories,
    studios,
    releaseYears,
    filters,
    filterCounts,
    totalToys: filterCounts.totalToys || 0,
    toggleCategory,
    toggleStudio,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    resetFilters
  }
}
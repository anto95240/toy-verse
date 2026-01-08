import { useState, useEffect, useMemo, useCallback } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import { applyFiltersToQuery, fetchFilterCounts } from '@/utils/filterQueries'
import type { Toy } from '@/types/theme'

interface Filters {
  categories: string[]
  studios: string[]
  nbPiecesRange: string
  isExposed: boolean | null
  isSoon: boolean | null
  releaseYear: string
}

interface FilterCounts {
  categories: Record<string, number>
  studios: Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed: Record<string, number>
  soon: Record<string, number>
  releaseYears: Record<string, number>
  totalToys?: number
}

const initialFilters: Filters = {
  categories: [],
  studios: [],
  nbPiecesRange: '',
  isExposed: null,
  isSoon: null,
  releaseYear: ''
}

export function useToyFilters(themeId: string, sessionExists: boolean) {
  const [toys, setToys] = useState<Toy[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [studios, setStudios] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [filterCounts, setFilterCounts] = useState<FilterCounts>(() => ({
    categories: {},
    studios: {},
    nbPiecesRanges: {},
    exposed: {},
    soon: {},
    releaseYears: {},
    totalToys: 0
  }))

  // 1. Stabiliser le client Supabase pour éviter les re-rendus inutiles
  const supabase = useMemo(() => getSupabaseClient(), [])

  // Charger les catégories
  useEffect(() => {
    if (!sessionExists) return

    const loadCategories = () => (supabase
      .from('toys')
      .select('categorie') as any)
      .eq('theme_id', themeId)
      .not('categorie', 'is', null)
      .order('categorie', { ascending: true })
      .then(({ data, error }: any) => {
        if (error) {
          console.error('Erreur chargement catégories:', error)
          setCategories([])
        } else {
          const uniqueCategories = Array.from(new Set(data?.map((c: any) => c.categorie).filter(Boolean) || [])) as string[]
          setCategories(uniqueCategories)
        }
      })

    loadCategories()

    const subscription = supabase
      .channel('toys-categories')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` },
        () => { loadCategories() }
      )
      .subscribe()

    return () => { subscription.unsubscribe() }
  }, [sessionExists, themeId, supabase])

  // Charger les studios
  useEffect(() => {
    if (!sessionExists) return

    const loadStudios = () => (supabase
      .from('toys')
      .select('studio') as any)
      .eq('theme_id', themeId)
      .not('studio', 'is', null)
      .order('studio', { ascending: true })
      .then(({ data, error }: any) => {
        if (error) {
          console.error('Erreur chargement studios:', error)
          setStudios([])
        } else {
          const uniqueStudios = Array.from(new Set(data?.map((s: any) => s.studio).filter(Boolean) || [])) as string[]
          setStudios(uniqueStudios)
        }
      })

    loadStudios()

    const subscription = supabase
      .channel('toys-studios')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` },
        () => { loadStudios() }
      )
      .subscribe()

    return () => { subscription.unsubscribe() }
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
        const sortedData = (data || []).sort((a: any, b: any) => {
          // Tri par numéro, etc.
          if (!a.numero && !b.numero) return 0
          if (!a.numero) return 1
          if (!b.numero) return -1
          const numA = parseInt(a.numero.toString(), 10)
          const numB = parseInt(b.numero.toString(), 10)
          if (isNaN(numA) && isNaN(numB)) return a.numero.localeCompare(b.numero)
          if (isNaN(numA)) return 1
          if (isNaN(numB)) return -1
          return numA - numB
        })
        setToys(sortedData)
      }
    })
  }, [sessionExists, themeId, filters, supabase])

  // Charger les compteurs
  useEffect(() => {
    if (!sessionExists) return

    async function loadFilterCounts() {
      try {
        const counts = await fetchFilterCounts(supabase as any, themeId, categories, studios, filters)
        setFilterCounts(counts)
      } catch (error) {
        console.error('Erreur chargement compteurs:', error)
      }
    }

    loadFilterCounts()
  }, [sessionExists, themeId, categories, studios, filters, supabase])

  // Charger les années
  const [releaseYears, setReleaseYears] = useState<string[]>([])

  useEffect(() => {
    if (!sessionExists) return

    const loadReleaseYears = () => (supabase
      .from('toys')
      .select('release_date') as any)
      .eq('theme_id', themeId)
      .not('release_date', 'is', null)
      .order('release_date', { ascending: false })
      .then(({ data, error }: any) => {
        if (error) {
          setReleaseYears([])
        } else {
          const uniqueYears = Array.from(
            new Set(
              (data || [])
                .map((r: any) => r.release_date ? r.release_date.toString() : null)
                .filter(Boolean) as string[]
            )
          ) as string[]
          setReleaseYears(uniqueYears)
        }
      })

    loadReleaseYears()

    const subscription = supabase
      .channel('toys-years')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` },
        () => { loadReleaseYears() }
      )
      .subscribe()

    return () => { subscription.unsubscribe() }
  }, [sessionExists, themeId, supabase])


  // =================================================================
  // 2. CORRECTION CRITIQUE : Envelopper tous les handlers dans useCallback
  // =================================================================

  const toggleCategory = useCallback((cat: string) => {
    setFilters((prev: Filters) => {
      const categories = prev.categories.includes(cat)
        ? prev.categories.filter((c: string) => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories }
    })
  }, [])

  const toggleStudio = useCallback((studio: string) => {
    setFilters((prev: Filters) => {
      const studios = prev.studios.includes(studio)
        ? prev.studios.filter((s: string) => s !== studio)
        : [...prev.studios, studio]
      return { ...prev, studios }
    })
  }, [])

  const handleNbPiecesChange = useCallback((range: string) => {
    setFilters((prev: Filters) => ({ ...prev, nbPiecesRange: range }))
  }, [])

  const handleExposedChange = useCallback((value: boolean | null) => {
    setFilters((prev: Filters) => ({ ...prev, isExposed: value }))
  }, [])

  // C'est CELUI-CI qui causait l'erreur spécifique que vous aviez
  const handleSoonChange = useCallback((value: boolean | null) => {
    setFilters((prev: Filters) => ({ ...prev, isSoon: value }))
  }, [])

  const handleReleaseYearChange = useCallback((year: string) => {
    setFilters((prev: Filters) => ({ ...prev, releaseYear: year }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

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
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
  const [releaseYears, setReleaseYears] = useState<string[]>([])
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

  const supabase = useMemo(() => getSupabaseClient(), [])

  // 1. Charger les catégories
  useEffect(() => {
    if (!sessionExists) return
    const loadCategories = () => (supabase.from('toys').select('categorie') as any)
      .eq('theme_id', themeId).not('categorie', 'is', null).order('categorie', { ascending: true })
      .then(({ data, error }: any) => {
        if (!error) {
          const unique = Array.from(new Set(data?.map((c: any) => c.categorie).filter(Boolean) || [])) as string[]
          setCategories(unique)
        }
      })
    loadCategories()
    const sub = supabase.channel('toys-categories').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` }, () => loadCategories()
    ).subscribe()
    return () => { sub.unsubscribe() }
  }, [sessionExists, themeId, supabase])

  // 2. Charger les studios
  useEffect(() => {
    if (!sessionExists) return
    const loadStudios = () => (supabase.from('toys').select('studio') as any)
      .eq('theme_id', themeId).not('studio', 'is', null).order('studio', { ascending: true })
      .then(({ data, error }: any) => {
        if (!error) {
          const unique = Array.from(new Set(data?.map((s: any) => s.studio).filter(Boolean) || [])) as string[]
          setStudios(unique)
        }
      })
    loadStudios()
    const sub = supabase.channel('toys-studios').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` }, () => loadStudios()
    ).subscribe()
    return () => { sub.unsubscribe() }
  }, [sessionExists, themeId, supabase])

  // 3. Charger les années
  useEffect(() => {
    if (!sessionExists) return
    const loadYears = () => (supabase.from('toys').select('release_date') as any)
      .eq('theme_id', themeId).not('release_date', 'is', null).order('release_date', { ascending: false })
      .then(({ data, error }: any) => {
        if (!error) {
          const unique = Array.from(new Set((data || []).map((r: any) => r.release_date?.toString()).filter(Boolean))) as string[]
          setReleaseYears(unique)
        }
      })
    loadYears()
    const sub = supabase.channel('toys-years').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'toys', filter: `theme_id=eq.${themeId}` }, () => loadYears()
    ).subscribe()
    return () => { sub.unsubscribe() }
  }, [sessionExists, themeId, supabase])

  // 4. Charger les jouets
  useEffect(() => {
    if (!sessionExists) return
    let query = supabase.from('toys').select('*').eq('theme_id', themeId)
    query = applyFiltersToQuery(query, filters)
    query.then(({ data, error }) => {
      if (!error) {
        const sorted = (data || []).sort((a: any, b: any) => {
          if (!a.numero) return 1; if (!b.numero) return -1;
          const numA = parseInt(a.numero.toString(), 10)
          const numB = parseInt(b.numero.toString(), 10)
          return isNaN(numA) || isNaN(numB) ? a.numero.localeCompare(b.numero) : numA - numB
        })
        setToys(sorted)
      }
    })
  }, [sessionExists, themeId, filters, supabase])

  // 5. Compteurs (Server Refresh)
  const refreshCountsFromServer = useCallback(() => {
    if (!sessionExists) return
    fetchFilterCounts(supabase as any, themeId, categories, studios, filters)
      .then(counts => setFilterCounts(counts))
      .catch(console.error)
  }, [sessionExists, themeId, categories, studios, filters, supabase])

  useEffect(() => {
    refreshCountsFromServer()
  }, [refreshCountsFromServer])

  // 6. MISE À JOUR OPTIMISTE (Client Side)
  const updateCountsOptimistically = useCallback((oldToy: Toy | null, newToy: Toy) => {
    // A. Mettre à jour les listes (Catégories/Studios) si nouvelles valeurs
    if (newToy.categorie && !categories.includes(newToy.categorie)) {
        setCategories(prev => [...prev, newToy.categorie!].sort())
    }
    if (newToy.studio && !studios.includes(newToy.studio)) {
        setStudios(prev => [...prev, newToy.studio].sort())
    }

    // B. Mettre à jour les compteurs
    setFilterCounts(prevCounts => {
      const newCounts: FilterCounts = JSON.parse(JSON.stringify(prevCounts));
      newCounts.totalToys = newCounts.totalToys || 0;
      const getYear = (dateStr: string | null) => dateStr ? new Date(dateStr).getFullYear().toString() : null;

      // Si modification, on décrémente l'ancien
      if (oldToy) {
        if (oldToy.categorie && newCounts.categories[oldToy.categorie]) newCounts.categories[oldToy.categorie]--;
        if (oldToy.studio && newCounts.studios[oldToy.studio]) newCounts.studios[oldToy.studio]--;
        const oldYear = getYear(oldToy.release_date?.toString() || null);
        if (oldYear && newCounts.releaseYears[oldYear]) newCounts.releaseYears[oldYear]--;
        if (oldToy.is_exposed && newCounts.exposed['true']) newCounts.exposed['true']--;
        if (oldToy.is_soon && newCounts.soon['true']) newCounts.soon['true']--;
      } else {
        // Ajout
        newCounts.totalToys++;
      }

      // On incrémente le nouveau
      if (newToy.categorie) newCounts.categories[newToy.categorie] = (newCounts.categories[newToy.categorie] || 0) + 1;
      if (newToy.studio) newCounts.studios[newToy.studio] = (newCounts.studios[newToy.studio] || 0) + 1;
      const newYear = getYear(newToy.release_date?.toString() || null);
      if (newYear) newCounts.releaseYears[newYear] = (newCounts.releaseYears[newYear] || 0) + 1;
      if (newToy.is_exposed) newCounts.exposed['true'] = (newCounts.exposed['true'] || 0) + 1;
      if (newToy.is_soon) newCounts.soon['true'] = (newCounts.soon['true'] || 0) + 1;
      
      return newCounts;
    });
  }, [categories, studios]);

  // Handlers
  const toggleCategory = useCallback((cat: string) => {
    setFilters(prev => ({ ...prev, categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat] }))
  }, [])
  const toggleStudio = useCallback((studio: string) => {
    setFilters(prev => ({ ...prev, studios: prev.studios.includes(studio) ? prev.studios.filter(s => s !== studio) : [...prev.studios, studio] }))
  }, [])
  const handleNbPiecesChange = useCallback((range: string) => setFilters(prev => ({ ...prev, nbPiecesRange: range })), [])
  const handleExposedChange = useCallback((value: boolean | null) => setFilters(prev => ({ ...prev, isExposed: value })), [])
  const handleSoonChange = useCallback((value: boolean | null) => setFilters(prev => ({ ...prev, isSoon: value })), [])
  const handleReleaseYearChange = useCallback((year: string) => setFilters(prev => ({ ...prev, releaseYear: year })), [])
  const resetFilters = useCallback(() => setFilters(initialFilters), [])

  return {
    toys, setToys,
    categories, studios, releaseYears, filters, filterCounts,
    totalToys: filterCounts.totalToys || 0,
    toggleCategory, toggleStudio, handleNbPiecesChange, handleExposedChange, handleSoonChange, handleReleaseYearChange, resetFilters,
    refreshCounts: refreshCountsFromServer,
    updateCountsOptimistically
  }
}
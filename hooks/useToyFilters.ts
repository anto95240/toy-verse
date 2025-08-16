import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'

interface Filters {
  categories: string[]
  nbPiecesRange: string
  isExposed: boolean | null
  isSoon: boolean | null
}

interface FilterCounts {
  categories: Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed: Record<string, number>
  soon: Record<string, number>
  totalToys?: number
}

const initialFilters: Filters = {
  categories: [],
  nbPiecesRange: '',
  isExposed: null,
  isSoon: null,
}

export function useToyFilters(themeId: string, sessionExists: boolean) {
  const [toys, setToys] = useState<Toy[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    categories: {},
    nbPiecesRanges: {},
    exposed: {},
    soon: {},
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

  // Charger jouets selon filtres
  useEffect(() => {
    if (!sessionExists) return

    let query = supabase
      .from('toys')
      .select('*')
      .eq('theme_id', themeId)

    if (filters.categories.length > 0) query = query.in('categorie', filters.categories)

    if (filters.nbPiecesRange) {
      if (filters.nbPiecesRange === '1501-2000') {
        query = query.gte('nb_pieces', 1501).lte('nb_pieces', 2000)
      } else if (filters.nbPiecesRange === '1001-1500') {
        query = query.gte('nb_pieces', 1001).lte('nb_pieces', 1500)
      } else if (filters.nbPiecesRange === '501-1000') {
        query = query.gte('nb_pieces', 501).lte('nb_pieces', 1000)
      } else if (filters.nbPiecesRange === '201-500') {
        query = query.gte('nb_pieces', 201).lte('nb_pieces', 500)
      } else if (filters.nbPiecesRange === '0-200') {
        query = query.gte('nb_pieces', 0).lte('nb_pieces', 200)
      } else {
        const [min, max] = filters.nbPiecesRange.split('-').map(Number)
        query = query.gte('nb_pieces', min).lte('nb_pieces', max)
      }
    }

    if (filters.isExposed !== null) query = query.eq('is_exposed', filters.isExposed)
    if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

    query.order('nom', { ascending: true }).then(({ data, error }) => {
      if (error) {
        console.error('Erreur chargement jouets:', error)
        setToys([])
      } else {
        setToys(data || [])
      }
    })
  }, [sessionExists, themeId, filters, supabase])

  // Charger les compteurs pour tous les filtres
  useEffect(() => {
    if (!sessionExists) return

    async function fetchFilterCounts() {
      // Calculer le total de jouets du thème
      let totalQuery = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', themeId)

      const { count: totalToys } = await totalQuery
      
      // Compteurs par catégorie
      const categoryCounts: Record<string, number> = {}
      await Promise.all(
        categories.map(async (cat) => {
          let query = supabase
            .from('toys')
            .select('id', { count: 'exact', head: true })
            .eq('theme_id', themeId)
            .eq('categorie', cat)

          // Appliquer les autres filtres (pas le filtre catégorie)
          if (filters.nbPiecesRange) {
            if (filters.nbPiecesRange === '1501-2000') {
              query = query.gte('nb_pieces', 1501).lte('nb_pieces', 2000)
            } else if (filters.nbPiecesRange === '1001-1500') {
              query = query.gte('nb_pieces', 1001).lte('nb_pieces', 1500)
            } else if (filters.nbPiecesRange === '501-1000') {
              query = query.gte('nb_pieces', 501).lte('nb_pieces', 1000)
            } else if (filters.nbPiecesRange === '201-500') {
              query = query.gte('nb_pieces', 201).lte('nb_pieces', 500)
            } else if (filters.nbPiecesRange === '0-200') {
              query = query.gte('nb_pieces', 0).lte('nb_pieces', 200)
            } else {
              const [min, max] = filters.nbPiecesRange.split('-').map(Number)
              query = query.gte('nb_pieces', min).lte('nb_pieces', max)
            }
          }

          if (filters.isExposed !== null) query = query.eq('is_exposed', filters.isExposed)
          if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

          const { count, error } = await query
          if (error) {
            console.error('Erreur count catégorie:', error)
            categoryCounts[cat] = 0
          } else {
            categoryCounts[cat] = count || 0
          }
        })
      )

      // Compteurs par nombre de pièces
      const nbPiecesRanges = ['0-200', '201-500', '501-1000', '1001-1500', '1501-2000']
      const nbPiecesCounts: Record<string, number> = {}
      
      await Promise.all(
        nbPiecesRanges.map(async (range) => {
          let query = supabase
            .from('toys')
            .select('id', { count: 'exact', head: true })
            .eq('theme_id', themeId)

          // Appliquer le filtre de nombre de pièces
          if (range === '1501-2000') {
            query = query.gte('nb_pieces', 1501).lte('nb_pieces', 2000)
          } else if (range === '1001-1500') {
            query = query.gte('nb_pieces', 1001).lte('nb_pieces', 1500)
          } else if (range === '501-1000') {
            query = query.gte('nb_pieces', 501).lte('nb_pieces', 1000)
          } else if (range === '201-500') {
            query = query.gte('nb_pieces', 201).lte('nb_pieces', 500)
          } else if (range === '0-200') {
            query = query.gte('nb_pieces', 0).lte('nb_pieces', 200)
          } else {
            const [min, max] = range.split('-').map(Number)
            query = query.gte('nb_pieces', min).lte('nb_pieces', max)
          }

          // Appliquer les autres filtres
          if (filters.categories.length > 0) query = query.in('categorie', filters.categories)
          if (filters.isExposed !== null) query = query.eq('is_exposed', filters.isExposed)
          if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

          const { count, error } = await query
          if (error) {
            console.error('Erreur count nb_pieces:', error)
            nbPiecesCounts[range] = 0
          } else {
            nbPiecesCounts[range] = count || 0
          }
        })
      )

      // Compteurs pour exposition
      const exposedCounts: Record<string, number> = {}
      await Promise.all(
        [true, false].map(async (isExposed) => {
          let query = supabase
            .from('toys')
            .select('id', { count: 'exact', head: true })
            .eq('theme_id', themeId)
            .eq('is_exposed', isExposed)

          // Appliquer les autres filtres
          if (filters.categories.length > 0) query = query.in('categorie', filters.categories)
          if (filters.nbPiecesRange) {
            if (filters.nbPiecesRange === '1501-2000') {
              query = query.gte('nb_pieces', 1501).lte('nb_pieces', 2000)
            } else if (filters.nbPiecesRange === '1001-1500') {
              query = query.gte('nb_pieces', 1001).lte('nb_pieces', 1500)
            } else if (filters.nbPiecesRange === '501-1000') {
              query = query.gte('nb_pieces', 501).lte('nb_pieces', 1000)
            } else if (filters.nbPiecesRange === '201-500') {
              query = query.gte('nb_pieces', 201).lte('nb_pieces', 500)
            } else if (filters.nbPiecesRange === '0-200') {
              query = query.gte('nb_pieces', 0).lte('nb_pieces', 200)
            } else {
              const [min, max] = filters.nbPiecesRange.split('-').map(Number)
              query = query.gte('nb_pieces', min).lte('nb_pieces', max)
            }
          }
          if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

          const { count, error } = await query
          if (error) {
            console.error('Erreur count exposition:', error)
          } else {
            exposedCounts[String(isExposed)] = count || 0
          }
        })
      )

      // Compteurs pour "prochainement"
      let soonQuery = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', themeId)
        .eq('is_soon', true)

      // Appliquer les autres filtres
      if (filters.categories.length > 0) soonQuery = soonQuery.in('categorie', filters.categories)
      if (filters.nbPiecesRange) {
        if (filters.nbPiecesRange === '1501-2000') {
          soonQuery = soonQuery.gte('nb_pieces', 1501).lte('nb_pieces', 2000)
        } else if (filters.nbPiecesRange === '1001-1500') {
          soonQuery = soonQuery.gte('nb_pieces', 1001).lte('nb_pieces', 1500)
        } else if (filters.nbPiecesRange === '501-1000') {
          soonQuery = soonQuery.gte('nb_pieces', 501).lte('nb_pieces', 1000)
        } else if (filters.nbPiecesRange === '201-500') {
          soonQuery = soonQuery.gte('nb_pieces', 201).lte('nb_pieces', 500)
        } else if (filters.nbPiecesRange === '0-200') {
          soonQuery = soonQuery.gte('nb_pieces', 0).lte('nb_pieces', 200)
        } else {
          const [min, max] = filters.nbPiecesRange.split('-').map(Number)
          soonQuery = soonQuery.gte('nb_pieces', min).lte('nb_pieces', max)
        }
      }
      if (filters.isExposed !== null) soonQuery = soonQuery.eq('is_exposed', filters.isExposed)

      const { count: soonCount, error: soonError } = await soonQuery
      const soonCounts: Record<string, number> = { 'true': soonCount || 0, 'false': 0 }

      setFilterCounts({
        categories: categoryCounts,
        nbPiecesRanges: nbPiecesCounts,
        exposed: exposedCounts,
        soon: soonCounts,
        totalToys: totalToys || 0
      })
    }

    fetchFilterCounts()
  }, [sessionExists, themeId, categories, filters, supabase])

  // Fonctions de gestion des filtres
  const toggleCategory = (cat: string) => {
    setFilters(prev => {
      const categories = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories }
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

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  return {
    toys,
    setToys,
    categories,
    filters,
    filterCounts,
    totalToys: filterCounts.totalToys || 0,
    toggleCategory,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    resetFilters
  }
}

import { SupabaseClient } from '@supabase/supabase-js'

export function applyNbPiecesFilter(query: any, nbPiecesRange: string) {
  if (!nbPiecesRange) return query

  if (nbPiecesRange === '1501-2000') {
    return query.gte('nb_pieces', 1501).lte('nb_pieces', 2000)
  } else if (nbPiecesRange === '1001-1500') {
    return query.gte('nb_pieces', 1001).lte('nb_pieces', 1500)
  } else if (nbPiecesRange === '501-1000') {
    return query.gte('nb_pieces', 501).lte('nb_pieces', 1000)
  } else if (nbPiecesRange === '201-500') {
    return query.gte('nb_pieces', 201).lte('nb_pieces', 500)
  } else if (nbPiecesRange === '0-200') {
    return query.gte('nb_pieces', 0).lte('nb_pieces', 200)
  } else {
    const [min, max] = nbPiecesRange.split('-').map(Number)
    return query.gte('nb_pieces', min).lte('nb_pieces', max)
  }
}

export function applyFiltersToQuery(query: any, filters: any) {
  if (filters.categories.length > 0) {
    query = query.in('categorie', filters.categories)
  }
  
  if (filters.studios.length > 0) {
    query = query.in('studio', filters.studios)
  }

  query = applyNbPiecesFilter(query, filters.nbPiecesRange)

  if (filters.isExposed !== null) {
    query = query.eq('is_exposed', filters.isExposed)
  }
  
  if (filters.isSoon !== null) {
    query = query.eq('is_soon', filters.isSoon)
  }

  return query
}

export async function fetchFilterCounts(
  supabase: SupabaseClient,
  themeId: string,
  categories: string[],
  studios: string[],
  filters: any
) {
  // Total toys count
  const totalQuery = supabase
    .from('toys')
    .select('id', { count: 'exact', head: true })
    .eq('theme_id', themeId)

  const { count: totalToys } = await totalQuery

  // Category counts
  const categoryCounts: Record<string, number> = {}
  await Promise.all(
    categories.map(async (cat) => {
      let query = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', themeId)
        .eq('categorie', cat)

      query = applyFiltersToQuery(query, {
        categories: [],
        studios: filters.studios,
        nbPiecesRange: filters.nbPiecesRange,
        isExposed: filters.isExposed,
        isSoon: filters.isSoon
      })

      const { count, error } = await query
      if (error) {
        console.error('Erreur count catégorie:', error)
        categoryCounts[cat] = 0
      } else {
        categoryCounts[cat] = count || 0
      }
    })
  )

  // Studio counts
  const studioCounts: Record<string, number> = {}
  await Promise.all(
    studios.map(async (studio) => {
      let query = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', themeId)
        .eq('studio', studio)

      query = applyFiltersToQuery(query, {
        categories: filters.categories,
        studios: [],
        nbPiecesRange: filters.nbPiecesRange,
        isExposed: filters.isExposed,
        isSoon: filters.isSoon
      })

      const { count, error } = await query
      if (error) {
        console.error('Erreur count studio:', error)
        studioCounts[studio] = 0
      } else {
        studioCounts[studio] = count || 0
      }
    })
  )

  // Nb pieces ranges counts
  const nbPiecesRanges = ['0-200', '201-500', '501-1000', '1001-1500', '1501-2000']
  const nbPiecesCounts: Record<string, number> = {}
  
  await Promise.all(
    nbPiecesRanges.map(async (range) => {
      let query = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', themeId)

      query = applyNbPiecesFilter(query, range)
      query = applyFiltersToQuery(query, {
        categories: filters.categories,
        studios: filters.studios,
        nbPiecesRange: '',
        isExposed: filters.isExposed,
        isSoon: filters.isSoon
      })

      const { count, error } = await query
      if (error) {
        console.error('Erreur count nb_pieces:', error)
        nbPiecesCounts[range] = 0
      } else {
        nbPiecesCounts[range] = count || 0
      }
    })
  )

  // Exposed counts
  const exposedCounts: Record<string, number> = {}
  await Promise.all(
    [true, false].map(async (isExposed) => {
      let query = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', themeId)
        .eq('is_exposed', isExposed)

      query = applyFiltersToQuery(query, {
        categories: filters.categories,
        studios: filters.studios,
        nbPiecesRange: filters.nbPiecesRange,
        isExposed: null,
        isSoon: filters.isSoon
      })

      const { count, error } = await query
      if (error) {
        console.error('Erreur count exposition:', error)
      } else {
        exposedCounts[String(isExposed)] = count || 0
      }
    })
  )

  // Soon counts
  let soonQuery = supabase
    .from('toys')
    .select('id', { count: 'exact', head: true })
    .eq('theme_id', themeId)
    .eq('is_soon', true)

  soonQuery = applyFiltersToQuery(soonQuery, {
    categories: filters.categories,
    studios: filters.studios,
    nbPiecesRange: filters.nbPiecesRange,
    isExposed: filters.isExposed,
    isSoon: null
  })

  const { count: soonCount } = await soonQuery
  const soonCounts: Record<string, number> = { 'true': soonCount || 0, 'false': 0 }

  return {
    categories: categoryCounts,
    studios: studioCounts,
    nbPiecesRanges: nbPiecesCounts,
    exposed: exposedCounts,
    soon: soonCounts,
    totalToys: totalToys || 0
  }
}

/**
 * lib/supabase/toyFilters.ts
 *
 * Moteur de filtres V2 — requêtes Supabase paramétrées avec :
 * - Filtrage par IDs (pas par texte)
 * - Hiérarchie : mode strict (catégorie exacte) vs mode étendu (inclure sous-catégories)
 * - Logique AND inter-dimensions / OR intra-dimension
 * - Calcul des comptages facettés
 * - Gestion des valeurs à 0 (affichées grisées côté UI)
 * - Fallback sur les champs legacy pour les jouets non encore migrés
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import { getCategoryDescendantIds, getStudioDescendantIds } from "./referential"

// =============================================================================
// Types
// =============================================================================

export interface FiltersV2 {
  // Dimensions V2 (par ID)
  categoryIds:  string[]
  studioIds:    string[]
  licenseIds:   string[]
  franchiseIds: string[]
  characterIds: string[]
  locationIds:  string[]

  // Mode hiérarchie
  categoryStrict: boolean  // true = exact, false = inclure sous-catégories
  studioStrict:   boolean  // true = exact, false = inclure studios enfants

  // Filtres scalaires (conservés)
  nbPiecesRange: string
  isExposed:     boolean | null
  isSoon:        boolean | null
  releaseYear:   string

  // Plage d'années
  releaseYearFrom?: number
  releaseYearTo?:   number
}

export interface FilterCountsV2 {
  categories:  Record<string, number>
  studios:     Record<string, number>
  licenses:    Record<string, number>
  franchises:  Record<string, number>
  characters:  Record<string, number>
  locations:   Record<string, number>
  nbPiecesRanges: Record<string, number>
  exposed:     Record<string, number>
  soon:        Record<string, number>
  releaseYears: Record<string, number>
  totalToys:   number
}

export const DEFAULT_FILTERS_V2: FiltersV2 = {
  categoryIds:    [],
  studioIds:      [],
  licenseIds:     [],
  franchiseIds:   [],
  characterIds:   [],
  locationIds:    [],
  categoryStrict: false,
  studioStrict:   false,
  nbPiecesRange:  "",
  isExposed:      null,
  isSoon:         null,
  releaseYear:    "",
}

// =============================================================================
// Requête principale
// =============================================================================

/**
 * Récupère les jouets filtrés selon les filtres V2.
 * Gère automatiquement le fallback legacy pour les jouets non migrés.
 */
export async function getFilteredToysV2(
  supabase: SupabaseClient,
  themeId: string,
  userId: string,
  filters: FiltersV2
) {
  // Résoudre les IDs de catégorie (avec descendants si mode étendu)
  const effectiveCategoryIds = await resolveEffectiveCategoryIds(supabase, filters)
  const effectiveStudioIds   = await resolveEffectiveStudioIds(supabase, filters)

  let query = supabase
    .from("toys")
    .select("*")
    .eq("theme_id", themeId)
    .eq("user_id", userId)

  // ── Catégorie ──────────────────────────────────────────────────────────────
  if (effectiveCategoryIds.length > 0) {
    // Filtre OR : le jouet a au moins un des IDs de catégorie
    // Pour les jouets non migrés : fallback sur le champ `categorie` (string)
    query = query.overlaps("category_ids", effectiveCategoryIds)
    // TODO Phase 3 : ajouter un OR sur le champ legacy `categorie` pour les jouets non migrés
  }

  // ── Studio ──────────────────────────────────────────────────────────────────
  if (effectiveStudioIds.length > 0) {
    query = query.overlaps("studio_ids", effectiveStudioIds)
  }

  // ── Licence ─────────────────────────────────────────────────────────────────
  if (filters.licenseIds.length > 0) {
    query = query.overlaps("license_ids", filters.licenseIds)
  }

  // ── Franchise ───────────────────────────────────────────────────────────────
  if (filters.franchiseIds.length > 0) {
    query = query.overlaps("franchise_ids", filters.franchiseIds)
  }

  // ── Personnage ──────────────────────────────────────────────────────────────
  if (filters.characterIds.length > 0) {
    query = query.overlaps("character_ids", filters.characterIds)
  }

  // ── Lieu d'achat ────────────────────────────────────────────────────────────
  if (filters.locationIds.length > 0) {
    query = query.overlaps("location_ids", filters.locationIds)
  }

  // ── Nombre de pièces ────────────────────────────────────────────────────────
  if (filters.nbPiecesRange) {
    const { gte, lte } = parsePiecesRange(filters.nbPiecesRange)
    if (gte !== null) query = query.gte("nb_pieces", gte)
    if (lte !== null) query = query.lte("nb_pieces", lte)
  }

  // ── Exposé ──────────────────────────────────────────────────────────────────
  if (filters.isExposed !== null) {
    query = query.eq("is_exposed", filters.isExposed)
  }

  // ── Prochainement ────────────────────────────────────────────────────────────
  if (filters.isSoon !== null) {
    query = query.eq("is_soon", filters.isSoon)
  }

  // ── Année ────────────────────────────────────────────────────────────────────
  if (filters.releaseYear) {
    query = query.eq("release_date", parseInt(filters.releaseYear))
  } else {
    if (filters.releaseYearFrom) query = query.gte("release_date", filters.releaseYearFrom)
    if (filters.releaseYearTo)   query = query.lte("release_date", filters.releaseYearTo)
  }

  query = query.order("nom", { ascending: true })

  const { data, error } = await query
  if (error) throw new Error(`getFilteredToysV2: ${error.message}`)
  return data ?? []
}

// =============================================================================
// Comptages facettés
// =============================================================================

/**
 * Calcule les comptages pour toutes les facettes.
 * Appelé à chaque changement de filtre pour mettre à jour les compteurs.
 */
export async function computeFacetCountsV2(
  supabase: SupabaseClient,
  themeId: string,
  userId: string,
  filters: FiltersV2
): Promise<FilterCountsV2> {
  // On récupère tous les jouets filtrés (sans la dimension en question)
  // pour calculer le compte de chaque valeur restante
  const toys = await getFilteredToysV2(supabase, themeId, userId, filters)

  const counts: FilterCountsV2 = {
    categories:    {},
    studios:       {},
    licenses:      {},
    franchises:    {},
    characters:    {},
    locations:     {},
    nbPiecesRanges: {},
    exposed:       { "true": 0, "false": 0 },
    soon:          { "true": 0, "false": 0 },
    releaseYears:  {},
    totalToys:     toys.length,
  }

  for (const toy of toys) {
    // Catégories
    for (const id of (toy.category_ids ?? [])) {
      counts.categories[id] = (counts.categories[id] ?? 0) + 1
    }
    // Studios
    for (const id of (toy.studio_ids ?? [])) {
      counts.studios[id] = (counts.studios[id] ?? 0) + 1
    }
    // Licences
    for (const id of (toy.license_ids ?? [])) {
      counts.licenses[id] = (counts.licenses[id] ?? 0) + 1
    }
    // Franchises
    for (const id of (toy.franchise_ids ?? [])) {
      counts.franchises[id] = (counts.franchises[id] ?? 0) + 1
    }
    // Personnages
    for (const id of (toy.character_ids ?? [])) {
      counts.characters[id] = (counts.characters[id] ?? 0) + 1
    }
    // Lieux
    for (const id of (toy.location_ids ?? [])) {
      counts.locations[id] = (counts.locations[id] ?? 0) + 1
    }
    // Pièces
    const range = getPiecesRange(toy.nb_pieces)
    if (range) counts.nbPiecesRanges[range] = (counts.nbPiecesRanges[range] ?? 0) + 1
    // Exposé
    counts.exposed[String(toy.is_exposed)] = (counts.exposed[String(toy.is_exposed)] ?? 0) + 1
    // Prochainement
    counts.soon[String(toy.is_soon)] = (counts.soon[String(toy.is_soon)] ?? 0) + 1
    // Années
    if (toy.release_date) {
      const y = String(toy.release_date)
      counts.releaseYears[y] = (counts.releaseYears[y] ?? 0) + 1
    }
  }

  return counts
}

// =============================================================================
// Helpers internes
// =============================================================================

async function resolveEffectiveCategoryIds(
  supabase: SupabaseClient,
  filters: FiltersV2
): Promise<string[]> {
  if (filters.categoryIds.length === 0) return []
  if (filters.categoryStrict) return filters.categoryIds

  // Mode étendu : récupérer tous les descendants
  const allIds = new Set<string>()
  for (const id of filters.categoryIds) {
    const descendants = await getCategoryDescendantIds(supabase, id)
    descendants.forEach((d) => allIds.add(d))
  }
  return Array.from(allIds)
}

async function resolveEffectiveStudioIds(
  supabase: SupabaseClient,
  filters: FiltersV2
): Promise<string[]> {
  if (filters.studioIds.length === 0) return []
  if (filters.studioStrict) return filters.studioIds

  const allIds = new Set<string>()
  for (const id of filters.studioIds) {
    const descendants = await getStudioDescendantIds(supabase, id)
    descendants.forEach((d) => allIds.add(d))
  }
  return Array.from(allIds)
}

function parsePiecesRange(range: string): { gte: number | null; lte: number | null } {
  if (range.endsWith("+")) return { gte: parseInt(range), lte: null }
  const [a, b] = range.split("-").map(Number)
  return { gte: a ?? null, lte: b ?? null }
}

function getPiecesRange(nb: number | null): string | null {
  if (nb === null) return null
  if (nb <= 200)   return "0-200"
  if (nb <= 500)   return "201-500"
  if (nb <= 1000)  return "501-1000"
  if (nb <= 1500)  return "1001-1500"
  if (nb <= 2000)  return "1501-2000"
  return "2000+"
}

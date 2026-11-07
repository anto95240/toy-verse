/**
 * lib/supabase/referential.ts
 *
 * Fonctions d'accès Supabase pour tous les référentiels V2 :
 * categories_v2, studios, licenses, franchises, characters, locations
 *
 * Toutes les fonctions acceptent un client Supabase en paramètre pour
 * être utilisables côté serveur (Server Components, Server Actions)
 * ou côté client selon le contexte.
 */

import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  CategoryV2,
  Studio,
  License,
  Franchise,
  Character,
  Location,
  ReferentialEntityKey,
  ReferentialEntity,
} from "@/types/theme"

// =============================================================================
// CATÉGORIES V2
// =============================================================================

/** Retourne toutes les catégories actives, ordonnées par level puis sort_order */
export async function getCategoriesV2(
  supabase: SupabaseClient
): Promise<CategoryV2[]> {
  const { data, error } = await supabase
    .from("categories_v2")
    .select("*")
    .eq("active", true)
    .order("level", { ascending: true })
    .order("sort_order", { ascending: true })

  if (error) throw new Error(`getCategoriesV2: ${error.message}`)
  return data ?? []
}

/** Retourne les catégories racines (level 0) */
export async function getRootCategories(
  supabase: SupabaseClient
): Promise<CategoryV2[]> {
  const { data, error } = await supabase
    .from("categories_v2")
    .select("*")
    .eq("active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true })

  if (error) throw new Error(`getRootCategories: ${error.message}`)
  return data ?? []
}

/** Retourne les enfants directs d'une catégorie */
export async function getCategoryChildren(
  supabase: SupabaseClient,
  parentId: string
): Promise<CategoryV2[]> {
  const { data, error } = await supabase
    .from("categories_v2")
    .select("*")
    .eq("active", true)
    .eq("parent_id", parentId)
    .order("sort_order", { ascending: true })

  if (error) throw new Error(`getCategoryChildren: ${error.message}`)
  return data ?? []
}

/**
 * Retourne tous les IDs descendants d'une catégorie (récursif).
 * Utilisé par le moteur de filtres en mode "étendu" (inclure les sous-catégories).
 */
export async function getCategoryDescendantIds(
  supabase: SupabaseClient,
  categoryId: string
): Promise<string[]> {
  const all = await getCategoriesV2(supabase)
  const ids: string[] = [categoryId]
  const queue = [categoryId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const children = all.filter((c) => c.parent_id === current)
    for (const child of children) {
      ids.push(child.id)
      queue.push(child.id)
    }
  }
  return ids
}

/** Construit l'arborescence complète des catégories */
export function buildCategoryTree(categories: CategoryV2[]): CategoryV2[] {
  const map = new Map<string, CategoryV2>()
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }))

  const roots: CategoryV2[] = []
  map.forEach((cat) => {
    if (cat.parent_id && map.has(cat.parent_id)) {
      const parent = map.get(cat.parent_id)!
      parent.children = parent.children ?? []
      parent.children.push(cat)
    } else {
      roots.push(cat)
    }
  })
  return roots
}

// =============================================================================
// STUDIOS
// =============================================================================

export async function getStudios(supabase: SupabaseClient): Promise<Studio[]> {
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(`getStudios: ${error.message}`)
  return data ?? []
}

export async function getStudioDescendantIds(
  supabase: SupabaseClient,
  studioId: string
): Promise<string[]> {
  const all = await getStudios(supabase)
  const ids: string[] = [studioId]
  const queue = [studioId]

  while (queue.length > 0) {
    const current = queue.shift()!
    const children = all.filter((s) => s.parent_studio_id === current)
    for (const child of children) {
      ids.push(child.id)
      queue.push(child.id)
    }
  }
  return ids
}

export function buildStudioTree(studios: Studio[]): Studio[] {
  const map = new Map<string, Studio>()
  studios.forEach((s) => map.set(s.id, { ...s, children: [] }))

  const roots: Studio[] = []
  map.forEach((studio) => {
    if (studio.parent_studio_id && map.has(studio.parent_studio_id)) {
      const parent = map.get(studio.parent_studio_id)!
      parent.children = parent.children ?? []
      parent.children.push(studio)
    } else {
      roots.push(studio)
    }
  })
  return roots
}

// =============================================================================
// LICENCES
// =============================================================================

export async function getLicenses(supabase: SupabaseClient): Promise<License[]> {
  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(`getLicenses: ${error.message}`)
  return data ?? []
}

// =============================================================================
// FRANCHISES
// =============================================================================

export async function getFranchises(
  supabase: SupabaseClient
): Promise<Franchise[]> {
  const { data, error } = await supabase
    .from("franchises")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(`getFranchises: ${error.message}`)
  return data ?? []
}

// =============================================================================
// PERSONNAGES
// =============================================================================

export async function getCharacters(
  supabase: SupabaseClient
): Promise<Character[]> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(`getCharacters: ${error.message}`)
  return data ?? []
}

/** Retourne les personnages appartenant à une franchise donnée */
export async function getCharactersByFranchise(
  supabase: SupabaseClient,
  franchiseId: string
): Promise<Character[]> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("active", true)
    .contains("franchise_ids", [franchiseId])
    .order("name", { ascending: true })

  if (error) throw new Error(`getCharactersByFranchise: ${error.message}`)
  return data ?? []
}

// =============================================================================
// LIEUX D'ACHAT
// =============================================================================

export async function getLocations(
  supabase: SupabaseClient
): Promise<Location[]> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(`getLocations: ${error.message}`)
  return data ?? []
}

export function buildLocationTree(locations: Location[]): Location[] {
  const map = new Map<string, Location>()
  locations.forEach((l) => map.set(l.id, { ...l, children: [] }))

  const roots: Location[] = []
  map.forEach((loc) => {
    if (loc.parent_location_id && map.has(loc.parent_location_id)) {
      const parent = map.get(loc.parent_location_id)!
      parent.children = parent.children ?? []
      parent.children.push(loc)
    } else {
      roots.push(loc)
    }
  })
  return roots
}

// =============================================================================
// RECHERCHE UNIFIÉE (pour l'autocomplete SmartSelect)
// =============================================================================

/** Résultat de recherche dans un référentiel */
export type ReferentialSearchResult = {
  id: string
  name: string
  slug: string
  aliases: string[]
  matchedAlias?: string   // alias qui a matché si différent du name
  entityType: ReferentialEntityKey
}

/**
 * Recherche dans un référentiel donné par nom ou alias.
 * Utilisé par l'API /api/referential/search
 *
 * IMPORTANT : Location n'est jamais inclus dans les suggestions croisées
 * (cf. §11 du cahier des charges). Cette fonction peut néanmoins le rechercher
 * directement pour le champ "Lieu d'achat" du formulaire.
 */
export async function searchReferential(
  supabase: SupabaseClient,
  entityType: ReferentialEntityKey,
  query: string,
  limit = 10
): Promise<ReferentialSearchResult[]> {
  const tableMap: Record<ReferentialEntityKey, string> = {
    category: "categories_v2",
    studio: "studios",
    license: "licenses",
    franchise: "franchises",
    character: "characters",
    location: "locations",
  }

  const table = tableMap[entityType]
  const q = query.trim().toLowerCase()
  const hasAliases = ["category", "studio", "license"].includes(entityType)
  const selectQuery = hasAliases ? "id, name, slug, aliases" : "id, name, slug"

  // Requête principale : match sur le nom
  const { data: nameData, error } = await supabase
    .from(table)
    .select(selectQuery)
    .eq("active", true)
    .ilike("name", `%${q}%`)
    .limit(limit)

  if (error) throw new Error(`searchReferential(${entityType}): ${error.message}`)

  const results: ReferentialSearchResult[] = []
  const seenIds = new Set<string>()

  for (const row of (nameData ?? []) as unknown as Array<ReferentialEntity & { aliases?: string[] }>) {
    seenIds.add(row.id)
    const aliases = (row as { aliases?: string[] }).aliases ?? []
    results.push({
      id: row.id,
      name: row.name,
      slug: row.slug,
      aliases,
      matchedAlias: undefined,
      entityType,
    })
  }

  // Recherche complémentaire dans les aliases (côté JS sur un ensemble filtré)
  // On charge tous les enregistrements actifs pour un matching alias précis
  // Optimisation : on n'exécute cette requête que si on n'a pas encore atteint la limite
  if (hasAliases && results.length < limit) {
    const { data: allData } = await supabase
      .from(table)
      .select(selectQuery)
      .eq("active", true)
      .not("aliases", "is", null)
      .limit(500) // couvre des tables jusqu'à ~500 entrées

    for (const row of (allData ?? []) as unknown as Array<ReferentialEntity & { aliases?: string[] }>) {
      if (seenIds.has(row.id)) continue
      const aliases = (row.aliases ?? []) as string[]
      const aliasMatch = aliases.find((a) => a.toLowerCase().includes(q))
      if (aliasMatch) {
        seenIds.add(row.id)
        results.push({
          id: row.id,
          name: row.name,
          slug: row.slug,
          aliases,
          matchedAlias: aliasMatch,
          entityType,
        })
        if (results.length >= limit) break
      }
    }
  }

  return results.slice(0, limit)
}


// =============================================================================
// SUGGESTIONS CROISÉES (auto-complétion intelligente)
// Woody → suggère Toy Story (franchise) et Pixar (studio)
// NE JAMAIS inclure Location dans ces suggestions (§11 CdC)
// =============================================================================

export type CrossSuggestion = {
  entityType: ReferentialEntityKey
  item: ReferentialEntity
  confidence: number  // 0–100
  reason: string
}

/**
 * Retourne des suggestions croisées à partir d'un personnage sélectionné.
 * Ex: Woody → franchise "Toy Story", studio "Pixar"
 * Location est intentionnellement exclu.
 */
export async function suggestFromCharacter(
  supabase: SupabaseClient,
  characterId: string
): Promise<CrossSuggestion[]> {
  const { data: char, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .single()

  if (error || !char) return []

  const suggestions: CrossSuggestion[] = []
  const franchiseIds: string[] = char.franchise_ids ?? []

  if (franchiseIds.length > 0) {
    const { data: franchises } = await supabase
      .from("franchises")
      .select("id, name, slug, active")
      .in("id", franchiseIds)
      .eq("active", true)

    for (const f of (franchises ?? [])) {
      suggestions.push({
        entityType: "franchise",
        item: f as ReferentialEntity,
        confidence: 90,
        reason: `${char.name} appartient à la franchise ${f.name}`,
      })
    }
  }

  return suggestions
}

/**
 * Retourne des suggestions croisées à partir d'une franchise sélectionnée.
 * Ex: Toy Story → studio "Pixar"
 */
export async function suggestFromFranchise(
  supabase: SupabaseClient,
  franchiseId: string
): Promise<CrossSuggestion[]> {
  // La relation franchise → studio est implicite (codée dans les données)
  // Pour l'instant, cette fonction retourne une liste vide
  // Elle sera enrichie quand la table de liaison franchise_studios sera ajoutée (V3+)
  void supabase; void franchiseId
  return []
}

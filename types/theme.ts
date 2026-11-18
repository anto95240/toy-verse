// =============================================================================
// Types métier ToyVerse — Theme & Toy
// =============================================================================

export type Theme = {
  id: string
  name: string
  slug: string
  image_url: string | null
  user_id: string
  profile_id: string | null
  created_at: string
}

// -----------------------------------------------------------------------------
// Type Toy V2
// Rétrocompatible : les champs legacy `categorie` et `studio` sont conservés.
// Les champs *_ids sont optionnels (undefined tant que le jouet n'est pas migré).
// -----------------------------------------------------------------------------
export type Toy = {
  id: string
  theme_id: string
  user_id: string
  nom: string
  taille: string | null
  nb_pieces: number | null
  numero: string | null
  is_exposed: boolean
  is_soon: boolean
  photo_url: string | null
  release_date: number | null
  /** noel | anniversaire | avent */
  gift_occasion?: string | null
  /** Année liée à l'occasion (Noël, anniversaire ou calendrier de l'Avent) */
  gift_year?: number | null
  created_at: string
  theme_name?: string

  // Champs legacy (conservés — règle n°1)
  categorie: string | null
  studio: string

  // Champs V2 (optionnels — undefined = jouet non encore migré)
  category_ids?: string[]
  studio_ids?: string[]
  license_ids?: string[]
  franchise_ids?: string[]
  character_ids?: string[]
  location_ids?: string[]

  // Données V2 (injectées côté client pour l'affichage en temps réel des noms d'entités après sauvegarde)
  v2_data?: any

  // Champs personnalisés dynamiques
  custom_fields_values?: Record<string, any> | null
}

// -----------------------------------------------------------------------------
// Helpers de compatibilité (fallback legacy → V2)
// -----------------------------------------------------------------------------

/** Retourne true si le jouet a été migré vers le système V2 */
export function isToyMigratedV2(toy: Toy): boolean {
  return (
    (toy.category_ids !== undefined && toy.category_ids.length > 0) ||
    (toy.studio_ids !== undefined && toy.studio_ids.length > 0)
  )
}

/** Retourne les IDs de catégorie à utiliser (V2 si disponible, sinon null) */
export function getEffectiveCategoryIds(toy: Toy): string[] | null {
  if (toy.category_ids && toy.category_ids.length > 0) return toy.category_ids
  return null
}

/** Retourne la valeur categorie legacy à afficher en fallback */
export function getLegacyCategory(toy: Toy): string | null {
  return toy.categorie ?? null
}

/** Retourne la valeur studio legacy à afficher en fallback */
export function getLegacyStudio(toy: Toy): string {
  return toy.studio
}

// -----------------------------------------------------------------------------
// Types utilitaires V2
// -----------------------------------------------------------------------------

/** Entité générique de référentiel */
export type ReferentialEntity = {
  id: string
  name: string
  slug: string
  active: boolean
}

export type CategoryV2 = ReferentialEntity & {
  parent_id: string | null
  level: number
  description: string | null
  icon: string | null
  sort_order: number
  aliases: string[]
  created_at: string
  // Enrichi côté client
  children?: CategoryV2[]
}

export type Studio = ReferentialEntity & {
  description: string | null
  parent_studio_id: string | null
  country: string | null
  aliases: string[]
  created_at: string
  // Enrichi côté client
  children?: Studio[]
}

export type License = ReferentialEntity & {
  description: string | null
  parent_license_id: string | null
  aliases: string[]
  created_at: string
}

export type Franchise = ReferentialEntity & {
  description: string | null
  parent_franchise_id: string | null
  aliases: string[]
  created_at: string
}

export type Character = ReferentialEntity & {
  description: string | null
  image_url: string | null
  franchise_ids: string[]
  created_at: string
}

export type Location = ReferentialEntity & {
  description: string | null
  parent_location_id: string | null
  created_at: string
  // Enrichi côté client
  children?: Location[]
}

/** Toutes les entités de référentiel sous un type union */
export type AnyReferentialEntity = CategoryV2 | Studio | License | Franchise | Character | Location

/** Clé d'entité de référentiel — utilisée pour identifier le type dans les APIs */
export type ReferentialEntityKey = 'category' | 'studio' | 'license' | 'franchise' | 'character' | 'location'

/** Résultat d'une suggestion d'auto-complétion croisée */
export type ReferentialSuggestion = {
  entity: ReferentialEntityKey
  item: ReferentialEntity
  /** Confiance de la suggestion (0–100) */
  confidence: number
  /** Raison de la suggestion (ex: "Woody appartient à Toy Story") */
  reason: string
}

/** Données V2 complètes enrichies d'un jouet (après jointure avec les référentiels) */
export type ToyWithReferentials = Toy & {
  categories?: CategoryV2[]
  studios?: Studio[]
  licenses?: License[]
  franchises?: Franchise[]
  characters?: Character[]
  locations?: Location[]
}
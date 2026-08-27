/**
 * scripts/analyze-legacy-data.ts
 *
 * Analyse les données legacy (`categorie` et `studio`) de tous les jouets
 * et produit un rapport JSON avec niveaux de confiance pour la migration V2.
 *
 * Usage (depuis la racine du projet) :
 *   npx tsx scripts/analyze-legacy-data.ts > scripts/migrations/migration-report.json
 *
 * Niveaux de confiance :
 *   - CERTAIN  (≥90%) : correspondance directe, peut être appliquée automatiquement
 *   - PROBABLE (50-89%) : correspondance partielle, demande confirmation
 *   - UNKNOWN  (<50%)  : aucune correspondance, valeur legacy conservée
 */

import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"
import * as path from "path"

// Charger les variables d'environnement (sans dotenv pour la portabilité)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// =============================================================================
// DICTIONNAIRE DE CORRESPONDANCE LEGACY → V2
// À enrichir au fil de la migration
// =============================================================================

type MatchEntry = {
  entityType: "category" | "studio" | "license" | "franchise" | "character" | "location"
  id: string
  name: string
  confidence: number
}

const LEGACY_CATEGORY_MAP: Record<string, MatchEntry> = {
  "figurine":              { entityType: "category", id: "cat_figurine",           name: "Figurine",           confidence: 100 },
  "figurines":             { entityType: "category", id: "cat_figurine",           name: "Figurine",           confidence: 95  },
  "figure":                { entityType: "category", id: "cat_figurine",           name: "Figurine",           confidence: 90  },
  "figurine articulée":    { entityType: "category", id: "cat_figurine_articulee", name: "Figurine articulée", confidence: 100 },
  "peluche":               { entityType: "category", id: "cat_peluche",            name: "Peluche",            confidence: 100 },
  "véhicule":              { entityType: "category", id: "cat_vehicule",           name: "Véhicule",           confidence: 100 },
  "vehicule":              { entityType: "category", id: "cat_vehicule",           name: "Véhicule",           confidence: 95  },
  "jeu":                   { entityType: "category", id: "cat_jeu",               name: "Jeu",                confidence: 100 },
  "construction":          { entityType: "category", id: "cat_construction",       name: "Construction",       confidence: 100 },
  "phare":                 { entityType: "category", id: "cat_phare",             name: "Phare",              confidence: 100 },
}

const LEGACY_STUDIO_MAP: Record<string, MatchEntry[]> = {
  "pixar":          [{ entityType: "studio",    id: "studio_pixar",        name: "Pixar",      confidence: 100 }],
  "disney":         [{ entityType: "studio",    id: "studio_disney",       name: "Disney",     confidence: 100 }],
  "disney pixar":   [
    { entityType: "studio",    id: "studio_disney",       name: "Disney",     confidence: 90 },
    { entityType: "studio",    id: "studio_pixar",        name: "Pixar",      confidence: 90 },
  ],
  "marvel":         [{ entityType: "studio",    id: "studio_marvel",       name: "Marvel",     confidence: 100 }],
  "star wars":      [{ entityType: "franchise", id: "franchise_star_wars", name: "Star Wars",  confidence: 95  }],
  "toy story":      [{ entityType: "franchise", id: "franchise_toy_story", name: "Toy Story",  confidence: 100 }],
  "harry potter":   [{ entityType: "franchise", id: "franchise_hp",        name: "Harry Potter", confidence: 100 }],
  "jurassic park":  [{ entityType: "franchise", id: "franchise_jp",        name: "Jurassic Park", confidence: 100 }],
  "bretagne":       [{ entityType: "location",  id: "location_bretagne",   name: "Bretagne",   confidence: 95  }],
  "disneyland":     [{ entityType: "location",  id: "location_dlp",        name: "Disneyland Paris", confidence: 85 }],
  "disneyland paris": [{ entityType: "location", id: "location_dlp",       name: "Disneyland Paris", confidence: 100 }],
}

// =============================================================================
// ANALYSE
// =============================================================================

type ConfidenceLevel = "CERTAIN" | "PROBABLE" | "UNKNOWN"

type ToyAnalysis = {
  toyId: string
  nom: string
  themeId: string
  legacy: {
    categorie: string | null
    studio: string
  }
  suggestions: {
    entityType: string
    id: string
    name: string
    confidence: number
    level: ConfidenceLevel
    source: string
  }[]
  status: "auto-migrable" | "needs-review" | "unresolved"
}

function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 90) return "CERTAIN"
  if (confidence >= 50) return "PROBABLE"
  return "UNKNOWN"
}

function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ")
}

function analyzeCategorie(categorie: string | null): ToyAnalysis["suggestions"] {
  if (!categorie) return []
  const key = normalizeKey(categorie)
  const match = LEGACY_CATEGORY_MAP[key]
  if (!match) return []
  return [{
    entityType: match.entityType,
    id: match.id,
    name: match.name,
    confidence: match.confidence,
    level: getConfidenceLevel(match.confidence),
    source: `categorie="${categorie}"`,
  }]
}

function analyzeStudio(studio: string): ToyAnalysis["suggestions"] {
  if (!studio) return []
  const suggestions: ToyAnalysis["suggestions"] = []

  // Essai de correspondance directe
  const directKey = normalizeKey(studio)
  if (LEGACY_STUDIO_MAP[directKey]) {
    for (const m of LEGACY_STUDIO_MAP[directKey]) {
      suggestions.push({
        entityType: m.entityType,
        id: m.id,
        name: m.name,
        confidence: m.confidence,
        level: getConfidenceLevel(m.confidence),
        source: `studio="${studio}" (correspondance directe)`,
      })
    }
    return suggestions
  }

  // Essai de correspondance partielle (le champ peut contenir plusieurs valeurs séparées par /)
  const parts = studio.split(/[/,]/).map((p) => normalizeKey(p.trim())).filter(Boolean)
  for (const part of parts) {
    if (LEGACY_STUDIO_MAP[part]) {
      for (const m of LEGACY_STUDIO_MAP[part]) {
        const alreadyFound = suggestions.find((s) => s.id === m.id)
        if (!alreadyFound) {
          suggestions.push({
            entityType: m.entityType,
            id: m.id,
            name: m.name,
            confidence: Math.max(50, m.confidence - 10), // légère pénalité pour correspondance partielle
            level: getConfidenceLevel(Math.max(50, m.confidence - 10)),
            source: `studio="${studio}" (partie "${part}")`,
          })
        }
      }
    }
  }

  return suggestions
}

async function main() {
  console.error("🔍 Analyse des données legacy ToyVerse...")

  const { data: toys, error } = await supabase
    .from("toys")
    .select("id, nom, theme_id, categorie, studio, category_ids, studio_ids")

  if (error) {
    console.error("❌ Erreur Supabase:", error.message)
    process.exit(1)
  }

  const results: ToyAnalysis[] = []
  let alreadyMigrated = 0

  for (const toy of (toys ?? [])) {
    // Ignorer les jouets déjà migrés (ont des IDs V2)
    const hasV2 = (toy.category_ids?.length ?? 0) > 0 || (toy.studio_ids?.length ?? 0) > 0
    if (hasV2) {
      alreadyMigrated++
      continue
    }

    const suggestions: ToyAnalysis["suggestions"] = [
      ...analyzeCategorie(toy.categorie),
      ...analyzeStudio(toy.studio ?? ""),
    ]

    const hasCertain  = suggestions.some((s) => s.level === "CERTAIN")
    const hasProbable = suggestions.some((s) => s.level === "PROBABLE")
    const allCertain  = suggestions.length > 0 && suggestions.every((s) => s.level === "CERTAIN")

    let status: ToyAnalysis["status"]
    if (allCertain)        status = "auto-migrable"
    else if (hasProbable || hasCertain) status = "needs-review"
    else                   status = "unresolved"

    results.push({
      toyId: toy.id,
      nom: toy.nom,
      themeId: toy.theme_id,
      legacy: { categorie: toy.categorie, studio: toy.studio },
      suggestions,
      status,
    })
  }

  // Statistiques
  const stats = {
    total: (toys ?? []).length,
    alreadyMigrated,
    toAnalyze: results.length,
    autoMigrable: results.filter((r) => r.status === "auto-migrable").length,
    needsReview: results.filter((r) => r.status === "needs-review").length,
    unresolved: results.filter((r) => r.status === "unresolved").length,
    generatedAt: new Date().toISOString(),
  }

  const report = { stats, toys: results }

  // Sortie JSON sur stdout
  console.log(JSON.stringify(report, null, 2))

  // Résumé sur stderr
  console.error("")
  console.error("📊 Rapport généré :")
  console.error(`  Total jouets         : ${stats.total}`)
  console.error(`  Déjà migrés (V2)     : ${stats.alreadyMigrated}`)
  console.error(`  À analyser           : ${stats.toAnalyze}`)
  console.error(`  Auto-migrables ✅    : ${stats.autoMigrable}`)
  console.error(`  À valider ⚠️         : ${stats.needsReview}`)
  console.error(`  Non résolus ❌       : ${stats.unresolved}`)
}

main().catch((e) => {
  console.error("❌ Erreur fatale:", e)
  process.exit(1)
})

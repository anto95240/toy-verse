/**
 * app/api/referential/search/route.ts
 *
 * GET /api/referential/search?entity=studio&q=pix&limit=10
 *
 * Recherche dans un référentiel par nom ou alias.
 * Utilisé par le composant SmartSelect pour l'autocomplete.
 *
 * Paramètres :
 *   entity  : "category" | "studio" | "license" | "franchise" | "character" | "location"
 *   q       : texte de recherche (min 1 caractère)
 *   limit   : nombre max de résultats (défaut: 10, max: 20)
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { searchReferential } from "@/lib/supabase/referential"
import type { ReferentialEntityKey } from "@/types/theme"

const VALID_ENTITIES: ReferentialEntityKey[] = [
  "category",
  "studio",
  "license",
  "franchise",
  "character",
  "location",
]

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const entity = searchParams.get("entity") as ReferentialEntityKey | null
  const q = searchParams.get("q") ?? ""
  const limitParam = searchParams.get("limit")
  const limit = Math.min(20, Math.max(1, parseInt(limitParam ?? "10") || 10))

  // Validation
  if (!entity || !VALID_ENTITIES.includes(entity)) {
    return NextResponse.json(
      { error: `Paramètre 'entity' invalide. Valeurs acceptées : ${VALID_ENTITIES.join(", ")}` },
      { status: 400 }
    )
  }

  if (q.trim().length === 0) {
    // Retourner une liste vide si pas de query (SmartSelect non encore saisi)
    return NextResponse.json({ results: [] })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const results = await searchReferential(supabase, entity, q, limit)
    return NextResponse.json({ results })
  } catch (error: unknown) {
    console.error("[GET /api/referential/search] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    )
  }
}

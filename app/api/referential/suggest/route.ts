/**
 * app/api/referential/suggest/route.ts
 *
 * POST /api/referential/suggest
 *
 * À partir d'une entité sélectionnée, retourne des suggestions d'entités liées.
 * Ex : sélectionner "Woody" (character) → suggère franchise "Toy Story" + studio "Pixar"
 *
 * IMPORTANT : Location n'est JAMAIS inclus dans les suggestions automatiques (§11 CdC).
 *
 * Body JSON :
 * {
 *   "fromEntity": "character",
 *   "fromId": "char_woody"
 * }
 *
 * Réponse :
 * {
 *   "suggestions": [
 *     { "entityType": "franchise", "item": {...}, "confidence": 90, "reason": "..." },
 *     { "entityType": "studio",    "item": {...}, "confidence": 75, "reason": "..." }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import {
  suggestFromCharacter,
  suggestFromFranchise,
} from "@/lib/supabase/referential"
import type { ReferentialEntityKey } from "@/types/theme"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 })
  }

  const { fromEntity, fromId } = body as {
    fromEntity?: ReferentialEntityKey
    fromId?: string
  }

  if (!fromEntity || !fromId) {
    return NextResponse.json(
      { error: "Paramètres 'fromEntity' et 'fromId' requis" },
      { status: 400 }
    )
  }

  // Location n'est jamais une source de suggestions croisées (§11 CdC)
  if (fromEntity === "location") {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const supabase = await createSupabaseServerClient()
    let suggestions: Awaited<ReturnType<typeof suggestFromCharacter>> = []

    switch (fromEntity) {
      case "character":
        suggestions = await suggestFromCharacter(supabase, fromId)
        break
      case "franchise":
        suggestions = await suggestFromFranchise(supabase, fromId)
        break
      default:
        // Pour les autres entités (studio, license, category), pas de suggestion croisée pour l'instant
        suggestions = []
    }

    return NextResponse.json({ suggestions })
  } catch (error: unknown) {
    console.error("[POST /api/referential/suggest] Erreur:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération des suggestions" },
      { status: 500 }
    )
  }
}

/**
 * app/api/referential/resolve/route.ts
 *
 * POST /api/referential/resolve
 *
 * Résout des IDs d'entités de référentiel en objets { id, name, slug }.
 * Utilisé par useToyModal pour pré-remplir les SmartSelect en mode édition.
 *
 * Note : utilise le client Admin pour bypasser le RLS sur les tables
 * franchises, characters, locations qui ne sont pas accessibles via RLS standard.
 * C'est ce qui causait les champs vides dans la popup d'édition après migration.
 *
 * Body JSON :
 * {
 *   "category_ids":  ["cat_xxx", "cat_yyy"],
 *   "studio_ids":    ["studio_xxx"],
 *   "license_ids":   [],
 *   "franchise_ids": [],
 *   "character_ids": [],
 *   "location_ids":  []
 * }
 *
 * Réponse :
 * {
 *   "categories":  [{ id, name, slug }],
 *   "studios":     [...],
 *   "licenses":    [...],
 *   "franchises":  [...],
 *   "characters":  [...],
 *   "locations":   [...]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

type EntityRow = { id: string; name: string; slug: string };

async function resolveIds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  ids: string[]
): Promise<EntityRow[]> {
  if (!ids || ids.length === 0) return [];
  const validIds = ids.filter(Boolean);
  if (validIds.length === 0) return [];

  const { data, error } = await supabase
    .from(table)
    .select("id, name, slug")
    .in("id", validIds);

  if (error) {
    console.error(`[resolve] Erreur table ${table}:`, error.message);
    return [];
  }

  // Conserver l'ordre original des IDs
  const map = new Map<string, EntityRow>((data ?? []).map((r: EntityRow) => [r.id, r]));
  return validIds.map((id) => map.get(id)).filter(Boolean) as EntityRow[];
}

export async function POST(req: NextRequest) {
  try {
    // Authentification via le client standard (respecte le RLS)
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    // Résolution via Admin pour bypasser le RLS sur franchises/characters/locations
    // Sans admin, ces tables sont inaccessibles → champs vides en mode édition après migration
    const supabaseAdmin = createSupabaseAdmin();

    const body = await req.json() as {
      category_ids?:  string[];
      studio_ids?:    string[];
      license_ids?:   string[];
      franchise_ids?: string[];
      character_ids?: string[];
      location_ids?:  string[];
    };

    const [categories, studios, licenses, franchises, characters, locations] =
      await Promise.all([
        resolveIds(supabaseAdmin, "categories_v2",  body.category_ids  ?? []),
        resolveIds(supabaseAdmin, "studios",         body.studio_ids    ?? []),
        resolveIds(supabaseAdmin, "licenses",        body.license_ids   ?? []),
        resolveIds(supabaseAdmin, "franchises",      body.franchise_ids ?? []),
        resolveIds(supabaseAdmin, "characters",      body.character_ids ?? []),
        resolveIds(supabaseAdmin, "locations",       body.location_ids  ?? []),
      ]);

    return NextResponse.json({
      categories,
      studios,
      licenses,
      franchises,
      characters,
      locations,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error("[POST /api/referential/resolve] Erreur:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ReferentialEntityKey } from "@/types/theme";
import { pickByNameOrAlias, searchReferential } from "@/lib/supabase/referential";

const TABLE_MAP: Record<ReferentialEntityKey, string> = {
  category:  "categories_v2",
  studio:    "studios",
  license:   "licenses",
  franchise: "franchises",
  character: "characters",
  location:  "locations",
};

const PARENT_FIELD_MAP: Record<ReferentialEntityKey, string | null> = {
  category:  "parent_id",
  studio:    "parent_studio_id",
  license:   "parent_license_id",
  franchise: "parent_franchise_id",
  character: null,
  location:  "parent_location_id",
};

/** Tables qui ont une colonne `aliases`. Personnage et lieu n'en ont pas. */
const HAS_ALIASES = new Set<ReferentialEntityKey>(["category", "studio", "license", "franchise"]);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateId(entityType: ReferentialEntityKey, slug: string): string {
  const prefixMap: Record<ReferentialEntityKey, string> = {
    category: "cat", studio: "studio", license: "license",
    franchise: "franchise", character: "char", location: "location",
  };
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefixMap[entityType]}_${slug.slice(0, 30)}_${random}`;
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json() as {
      entityType: ReferentialEntityKey;
      name: string;
      parentId?: string | null;
    };

    if (!body.entityType || !body.name?.trim()) {
      return NextResponse.json({ error: "entityType et name requis" }, { status: 400 });
    }

    const table = TABLE_MAP[body.entityType];
    const name = body.name.trim();
    const slug = generateSlug(name);
    const id = generateId(body.entityType, slug);

    // Admin : les lieux / franchises / personnages (et souvent tout le référentiel)
    // ne sont pas insérables ni listables via le client utilisateur (RLS).
    const db = createSupabaseAdmin();

    if (HAS_ALIASES.has(body.entityType)) {
      try {
        const hits = await searchReferential(db, body.entityType, name, 8);
        const picked = pickByNameOrAlias(hits, name);
        const query = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const fold = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const exact = !!picked && (
          fold(picked.name) === query ||
          (picked.aliases ?? []).some((alias) => fold(alias) === query) ||
          (picked.matchedAlias ? fold(picked.matchedAlias) === query : false)
        );
        if (picked && exact) {
          return NextResponse.json({
            success: true,
            existed: true,
            entity: { id: picked.id, name: picked.name, slug: picked.slug, entityType: body.entityType },
          });
        }
      } catch {
        // Recherche par alias indisponible : on continue avec le slug.
      }
    }

    // Déjà présent → on le renvoie pour qu'il apparaisse dans les listes
    const { data: existing } = await db
      .from(table)
      .select("id, name, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        existed: true,
        entity: { id: existing.id, name: existing.name, slug: existing.slug, entityType: body.entityType },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      id,
      name,
      slug,
      active: true,
    };

    if (HAS_ALIASES.has(body.entityType)) {
      payload.aliases = [];
    }

    const parentField = PARENT_FIELD_MAP[body.entityType];
    if (parentField && body.parentId) {
      payload[parentField] = body.parentId;
    }

    if (body.entityType === "category") {
      payload.icon = null;
      payload.sort_order = 0;
      if (body.parentId) {
        const { data: parent } = await db
          .from("categories_v2")
          .select("level")
          .eq("id", body.parentId)
          .single();
        payload.level = (parent?.level ?? 0) + 1;
      } else {
        payload.level = 0;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (db as any).from(table).insert(payload);

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: again } = await db.from(table).select("id, name, slug").eq("slug", slug).maybeSingle();
        if (again) {
          return NextResponse.json({
            success: true,
            existed: true,
            entity: { id: again.id, name: again.name, slug: again.slug, entityType: body.entityType },
          });
        }
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      entity: { id, name, slug, entityType: body.entityType },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error("[Migration CreateEntity API] Error:", err);
    return NextResponse.json({ error: "Erreur interne", details: message }, { status: 500 });
  }
}

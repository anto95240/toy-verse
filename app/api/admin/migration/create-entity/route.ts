import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReferentialEntityKey } from "@/types/theme";

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
    const slug = generateSlug(body.name.trim());
    const id = generateId(body.entityType, slug);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      id,
      name: body.name.trim(),
      slug,
      active: true,
      aliases: [],
    };

    const parentField = PARENT_FIELD_MAP[body.entityType];
    if (parentField && body.parentId !== undefined) {
      payload[parentField] = body.parentId;
    }

    // Champs spécifiques aux catégories
    if (body.entityType === "category") {
      payload.icon = null;
      payload.sort_order = 0;
      if (body.parentId) {
        const { data: parent } = await supabase
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
    const { error: insertError } = await (supabase as any).from(table).insert(payload);

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: `Entrée déjà existante (slug: ${slug})` }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      entity: { id, name: body.name.trim(), slug, entityType: body.entityType },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error("[Migration CreateEntity API] Error:", err);
    return NextResponse.json({ error: "Erreur interne", details: message }, { status: 500 });
  }
}

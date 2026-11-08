"use server";

/**
 * app/actions/referential.ts
 *
 * Server Actions CRUD pour la gestion des référentiels (back-office).
 * Toutes les actions requièrent d'être authentifié.
 *
 * Actions disponibles :
 *  - createReferentialEntity : créer une entité dans un référentiel
 *  - updateReferentialEntity : modifier une entité existante
 *  - archiveReferentialEntity : désactiver (soft delete) une entité
 *  - mergeReferentialEntities : fusionner deux entités (dédoublonnage)
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = { from: (table: string) => any; auth: any };
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { ReferentialEntityKey } from "@/types/theme";
import { pickByNameOrAlias, searchReferential } from "@/lib/supabase/referential";

// =============================================================================
// Mapping entité → table Supabase
// =============================================================================

const TABLE_MAP: Record<ReferentialEntityKey, string> = {
  category:  "categories_v2",
  studio:    "studios",
  license:   "licenses",
  franchise: "franchises",
  character: "characters",
  location:  "locations",
};

const HAS_ALIASES = new Set<ReferentialEntityKey>(["category", "studio", "license", "franchise"]);

const PARENT_ID_FIELD: Record<ReferentialEntityKey, string | null> = {
  category:  "parent_id",
  studio:    "parent_studio_id",
  license:   "parent_license_id",
  franchise: "parent_franchise_id",
  character: null, // les personnages n'ont pas de parent direct
  location:  "parent_location_id",
};

// =============================================================================
// Types de retour
// =============================================================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// =============================================================================
// Créer une entité
// =============================================================================

export type CreateEntityInput = {
  entityType: ReferentialEntityKey;
  name: string;
  slug?: string;           // généré automatiquement si absent
  description?: string;
  parentId?: string | null;
  aliases?: string[];
  icon?: string;           // uniquement pour les catégories
  sortOrder?: number;
};

export async function createReferentialEntity(
  input: CreateEntityInput
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: "Non authentifié" };

  // Écriture admin : le client utilisateur est bloqué par le RLS sur plusieurs référentiels
  const db = createSupabaseAdmin() as unknown as AnySupabase;
  const table = TABLE_MAP[input.entityType];
  const slug = input.slug ?? generateSlug(input.name);

  if (HAS_ALIASES.has(input.entityType)) {
    try {
      const hits = await searchReferential(createSupabaseAdmin(), input.entityType, input.name.trim(), 8);
      const picked = pickByNameOrAlias(hits, input.name);
      const query = input.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const exact = picked && (
        picked.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === query ||
        (picked.aliases ?? []).some((alias) => alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === query) ||
        (picked.matchedAlias && picked.matchedAlias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === query)
      );
      if (picked && exact) return { success: true, data: { id: picked.id } };
    } catch {
      // Colonne aliases absente : on crée l'entrée normalement.
    }
  }
  const id = generateId(input.entityType, slug);

  // Construction du payload selon le type d'entité
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {
    id,
    name: input.name.trim(),
    slug,
    active: true,
  };

  if (HAS_ALIASES.has(input.entityType)) {
    payload.aliases = input.aliases ?? [];
  }

  if (input.description) payload.description = input.description;

  // Champ parent
  const parentField = PARENT_ID_FIELD[input.entityType];
  if (parentField && input.parentId !== undefined) {
    payload[parentField] = input.parentId;
  }

  // Champs spécifiques
  if (input.entityType === "category") {
    payload.icon       = input.icon ?? null;
    payload.sort_order = input.sortOrder ?? 0;
    // Calculer le level depuis le parent
    if (input.parentId) {
      const { data: parent } = await createSupabaseAdmin()
        .from("categories_v2")
        .select("level")
        .eq("id", input.parentId)
        .single();
      payload.level = (parent?.level ?? 0) + 1;
    } else {
      payload.level = 0;
    }
  }

  const { error } = await db.from(table).insert(payload);
  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await createSupabaseAdmin()
        .from(table)
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (existing?.id) {
        return { success: true, data: { id: existing.id } };
      }
      return { success: false, error: `Une entrée avec ce slug existe déjà (${slug})` };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/referential");
  return { success: true, data: { id } };
}

// =============================================================================
// Modifier une entité
// =============================================================================

export type UpdateEntityInput = {
  entityType: ReferentialEntityKey;
  id: string;
  name?: string;
  description?: string;
  parentId?: string | null;
  aliases?: string[];
  icon?: string;
  sortOrder?: number;
  active?: boolean;
};

export async function updateReferentialEntity(
  input: UpdateEntityInput
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: "Non authentifié" };

  const db = supabase as unknown as AnySupabase;
  const table = TABLE_MAP[input.entityType];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {};

  if (input.name !== undefined)        payload.name        = input.name.trim();
  if (input.description !== undefined) payload.description = input.description;
  if (input.aliases !== undefined)     payload.aliases     = input.aliases;
  if (input.active !== undefined)      payload.active      = input.active;
  if (input.icon !== undefined && input.entityType === "category") payload.icon = input.icon;
  if (input.sortOrder !== undefined && input.entityType === "category") payload.sort_order = input.sortOrder;

  const parentField = PARENT_ID_FIELD[input.entityType];
  if (parentField && input.parentId !== undefined) {
    payload[parentField] = input.parentId;
  }

  if (Object.keys(payload).length === 0) {
    return { success: false, error: "Aucun champ à modifier" };
  }

  const { error } = await db.from(table).update(payload).eq("id", input.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/referential");
  return { success: true, data: undefined };
}

// =============================================================================
// Archiver (soft delete)
// =============================================================================

export async function archiveReferentialEntity(
  entityType: ReferentialEntityKey,
  id: string
): Promise<ActionResult> {
  return updateReferentialEntity({ entityType, id, active: false });
}

export async function restoreReferentialEntity(
  entityType: ReferentialEntityKey,
  id: string
): Promise<ActionResult> {
  return updateReferentialEntity({ entityType, id, active: true });
}

// =============================================================================
// Fusionner deux entités (dédoublonnage)
// =============================================================================

/**
 * Fusionne `sourceId` dans `targetId` :
 * - Tous les jouets qui référencent `sourceId` sont mis à jour pour référencer `targetId`
 * - `sourceId` est archivé (active = false)
 * - Les aliases de `sourceId` sont ajoutés à `targetId`
 */
export async function mergeReferentialEntities(
  entityType: ReferentialEntityKey,
  sourceId: string,
  targetId: string
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: "Non authentifié" };

  if (sourceId === targetId) {
    return { success: false, error: "Source et cible identiques" };
  }

  const idsField = `${entityType === "category" ? "category" : entityType}_ids` as
    | "category_ids" | "studio_ids" | "license_ids" | "franchise_ids" | "character_ids" | "location_ids";

  // 1. Récupérer tous les jouets qui ont sourceId dans leur tableau d'IDs
  const { data: toys, error: toysError } = await supabase
    .from("toys")
    .select(`id, ${idsField}`)
    .contains(idsField, [sourceId]);

  if (toysError) return { success: false, error: toysError.message };

  // 2. Remplacer sourceId par targetId dans chaque jouet
  for (const toy of (toys ?? [])) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentIds: string[] = (toy as any)[idsField] ?? [];
    const newIds = currentIds.map((id: string) => (id === sourceId ? targetId : id));
    // Dédupliquer
    const uniqueIds = Array.from(new Set(newIds));

    const { error: updateError } = await supabase
      .from("toys")
      .update({ [idsField]: uniqueIds })
      .eq("id", toy.id);

    if (updateError) return { success: false, error: updateError.message };
  }

  // 3. Récupérer les aliases de la source pour les ajouter à la cible
  const table = TABLE_MAP[entityType];
  const db = supabase as unknown as AnySupabase;
  const { data: source } = await db
    .from(table)
    .select("name, aliases")
    .eq("id", sourceId)
    .single();

  if (source) {
    const { data: target } = await db
      .from(table)
      .select("aliases")
      .eq("id", targetId)
      .single();

    const existingAliases: string[] = target?.aliases ?? [];
    const sourceAliases: string[]   = source.aliases ?? [];
    const newAliases = Array.from(new Set([
      ...existingAliases,
      ...sourceAliases,
      source.name, // ajouter le nom de la source comme alias
    ]));

    await db.from(table).update({ aliases: newAliases }).eq("id", targetId);
  }

  // 4. Archiver la source
  await db.from(table).update({ active: false }).eq("id", sourceId);

  revalidatePath("/admin/referential");
  return { success: true, data: undefined };
}

// =============================================================================
// Migration : appliquer une suggestion confirmée
// =============================================================================

export type MigrationDecision = {
  toyId: string;
  category_ids: string[];
  studio_ids: string[];
  franchise_ids: string[];
  character_ids: string[];
  location_ids: string[];
  // Métadonnées déduites par l'IA (optionnelles)
  numero?: string | null;
  nb_pieces?: number | null;
  release_date?: number | null;
  gift_occasion?: string | null;
  gift_year?: number | null;
  taille?: string | null;
};

export async function applyMigrationDecisions(
  input: MigrationDecision
): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: "Non authentifié" };

  if (!input.category_ids || input.category_ids.length === 0) {
    return { success: false, error: "La catégorie est requise pour valider la migration" };
  }

  // Les sélections « Créer … » anciennes portaient un id `new:Nom` jamais inséré en base
  const category_ids = await materializeIds("category", input.category_ids);
  const studio_ids = await materializeIds("studio", input.studio_ids);
  const franchise_ids = await materializeIds("franchise", input.franchise_ids);
  const character_ids = await materializeIds("character", input.character_ids);
  const location_ids = await materializeIds("location", input.location_ids);

  const updatePayload: Record<string, unknown> = {
    category_ids,
    studio_ids,
    franchise_ids,
    character_ids,
    location_ids,
  };

  // Sauvegarder les métadonnées IA si fournies (ne pas écraser avec null)
  if (input.numero !== undefined && input.numero !== null) updatePayload.numero = input.numero;
  if (input.nb_pieces !== undefined && input.nb_pieces !== null) updatePayload.nb_pieces = input.nb_pieces;
  if (input.release_date !== undefined && input.release_date !== null) updatePayload.release_date = input.release_date;
  if (input.gift_occasion !== undefined) updatePayload.gift_occasion = input.gift_occasion;
  if (input.gift_year !== undefined) updatePayload.gift_year = input.gift_year;
  if (input.taille !== undefined && input.taille !== null) updatePayload.taille = input.taille;

  const { error: updateError } = await supabase
    .from("toys")
    .update(updatePayload)
    .eq("id", input.toyId)
    .eq("user_id", user.id);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/");
  return { success: true, data: undefined };
}

// =============================================================================
// Helpers
// =============================================================================

/** Crée en base les ids temporaires `new:Nom` et renvoie de vrais ids. */
async function materializeIds(
  entityType: ReferentialEntityKey,
  ids: string[] | undefined
): Promise<string[]> {
  if (!ids?.length) return [];
  const out: string[] = [];
  for (const id of ids) {
    if (!id?.startsWith("new:")) {
      if (id) out.push(id);
      continue;
    }
    const name = id.slice(4).trim();
    if (!name) continue;
    const created = await createReferentialEntity({ entityType, name });
    if (created.success) out.push(created.data.id);
  }
  return out;
}

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
    category:  "cat",
    studio:    "studio",
    license:   "license",
    franchise: "franchise",
    character: "char",
    location:  "location",
  };
  const prefix = prefixMap[entityType];
  const random = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${slug.slice(0, 30)}_${random}`;
}

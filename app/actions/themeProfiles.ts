"use server";

/**
 * app/actions/themeProfiles.ts
 *
 * Server Actions CRUD pour les profils de thèmes personnalisés.
 * Chaque profil appartient à un utilisateur (user_id).
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = { from: (table: string) => any; auth: any };

// =============================================================================
// Type partagé — représente un profil tel que stocké en DB
// =============================================================================

export type CustomFieldType = "text" | "number" | "boolean" | "textarea" | "select";

export type CustomFieldDefinition = {
  id: string; // cf_xxxx
  label: string;
  type: CustomFieldType;
  options?: string[]; // Pour le type "select"
  required?: boolean;
};

export type ThemeProfileDB = {
  id: string;
  user_id: string;
  label: string;
  emoji: string;
  primary_fields: string[];
  details_first_fields: string[];
  hidden_fields: string[];
  field_labels: Record<string, string>;
  field_placeholders: Record<string, string>;
  suggested_category_names: string[];
  hint: string | null;
  auto_open_details: boolean;
  custom_fields_definition: CustomFieldDefinition[];
  created_at: string;
  updated_at: string;
};

export type ThemeProfileInput = Omit<ThemeProfileDB, "id" | "user_id" | "created_at" | "updated_at">;

// =============================================================================
// Lire tous les profils de l'utilisateur courant
// =============================================================================

export async function getUserThemeProfiles(): Promise<{ profiles: ThemeProfileDB[]; error?: string }> {
  const supabase = (await createSupabaseServerClient()) as unknown as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profiles: [], error: "Non authentifié" };

  const { data, error } = await supabase
    .from("theme_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return { profiles: [], error: error.message };
  return { profiles: (data || []) as ThemeProfileDB[] };
}

// =============================================================================
// Créer un nouveau profil
// =============================================================================

export async function createThemeProfile(
  input: ThemeProfileInput
): Promise<{ success: boolean; profile?: ThemeProfileDB; error?: string }> {
  const supabase = (await createSupabaseServerClient()) as unknown as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("theme_profiles")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/profile/type-toy");
  return { success: true, profile: data as ThemeProfileDB };
}

// =============================================================================
// Modifier un profil existant
// =============================================================================

export async function updateThemeProfile(
  id: string,
  input: Partial<ThemeProfileInput>
): Promise<{ success: boolean; error?: string }> {
  const supabase = (await createSupabaseServerClient()) as unknown as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("theme_profiles")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/profile/type-toy");
  revalidatePath("/");
  return { success: true };
}

// =============================================================================
// Supprimer un profil
// =============================================================================

export async function deleteThemeProfile(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = (await createSupabaseServerClient()) as unknown as AnySupabase;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // Détacher les thèmes qui utilisaient ce profil
  await (supabase as any)
    .from("themes")
    .update({ profile_id: null })
    .eq("profile_id", id)
    .eq("user_id", user.id);

  const { error } = await supabase
    .from("theme_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/profile/type-toy");
  return { success: true };
}

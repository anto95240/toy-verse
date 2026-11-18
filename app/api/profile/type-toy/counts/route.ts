import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/profile/type-toy/counts
 * Retourne un Record<profileId, toyCount> pour l'utilisateur connecté.
 * Un jouet est "assigné" à un profil via son thème (themes.profile_id).
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({}, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: themes, error: themeError } = await (supabase as any)
      .from("themes")
      .select("id, profile_id")
      .eq("user_id", user.id)
      .not("profile_id", "is", null);

    if (themeError) throw themeError;

    const themeIds = (themes ?? []).map((t: { id: string; profile_id: string }) => t.id);
    if (themeIds.length === 0) return NextResponse.json({});

    // Compte les jouets par thème
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: toys, error: toyError } = await (supabase as any)
      .from("toys")
      .select("theme_id")
      .in("theme_id", themeIds)
      .eq("user_id", user.id);

    if (toyError) throw toyError;

    // Map themeId → profileId
    const themeProfileMap = new Map<string, string>();
    for (const t of themes ?? []) {
      if (t.profile_id) themeProfileMap.set(t.id, t.profile_id);
    }

    // Agréger par profileId
    const counts: Record<string, number> = {};
    for (const toy of toys ?? []) {
      const profileId = themeProfileMap.get(toy.theme_id);
      if (profileId) counts[profileId] = (counts[profileId] ?? 0) + 1;
    }

    return NextResponse.json(counts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

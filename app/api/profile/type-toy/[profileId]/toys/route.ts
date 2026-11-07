import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: themes, error: themeError } = await (supabase as any)
      .from("themes")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("profile_id", profileId);

    if (themeError) throw themeError;

    const themeIds = (themes ?? []).map((t: { id: string }) => t.id);
    const themeNameMap = new Map<string, string>();
    for (const t of themes ?? []) themeNameMap.set(t.id, t.name);

    if (themeIds.length === 0) {
      return NextResponse.json({ toys: [], themes: [] });
    }

    const { data: toys, error: toyError } = await supabase
      .from("toys")
      .select("id, nom, photo_url, theme_id, categorie, studio, category_ids, is_exposed, is_soon, created_at")
      .in("theme_id", themeIds)
      .eq("user_id", user.id)
      .order("nom", { ascending: true });

    if (toyError) throw toyError;

    const enrichedToys = (toys ?? []).map((toy) => ({
      ...toy,
      theme_name: themeNameMap.get(toy.theme_id) ?? "",
    }));

    return NextResponse.json({ toys: enrichedToys, themes: themes ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
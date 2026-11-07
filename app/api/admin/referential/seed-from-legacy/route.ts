import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSlug } from "@/utils/slugUtils";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Récupérer tous les jouets pour extraire les valeurs uniques
    const { data: toys, error: toysError } = await supabase
      .from("toys")
      .select("categorie, studio")
      .eq("user_id", user.id);

    if (toysError) throw toysError;

    const uniqueCategories = new Set<string>();
    const uniqueStudios = new Set<string>();

    (toys || []).forEach(toy => {
      if (toy.categorie && toy.categorie.trim() !== "") {
        uniqueCategories.add(toy.categorie.trim());
      }
      if (toy.studio && toy.studio.trim() !== "") {
        uniqueStudios.add(toy.studio.trim());
      }
    });

    // 2. Récupérer les catégories existantes pour ne pas recréer
    const { data: existingCategories } = await supabase.from("categories_v2").select("slug");
    const existingCatSlugs = new Set((existingCategories || []).map(c => c.slug));

    // 3. Insérer les nouvelles catégories (dédoublonnées par slug)
    const categoryMap = new Map<string, any>();
    uniqueCategories.forEach(name => {
      const slug = createSlug(name);
      if (!existingCatSlugs.has(slug) && !categoryMap.has(slug)) {
        categoryMap.set(slug, {
          id: `cat_${slug.replace(/-/g, "_")}_${Date.now().toString().slice(-4)}`,
          name,
          slug,
          aliases: [name.toLowerCase()]
        });
      }
    });
    const categoriesToInsert = Array.from(categoryMap.values());

    let catCount = 0;
    if (categoriesToInsert.length > 0) {
      const { error: insertCatError } = await supabaseAdmin.from("categories_v2").insert(categoriesToInsert);
      if (insertCatError) {
         console.error("Erreur insertion catégories", insertCatError);
      } else {
         catCount = categoriesToInsert.length;
      }
    }

    // 4. Récupérer les studios existants
    const { data: existingStudios } = await supabase.from("studios").select("slug");
    const existingStudioSlugs = new Set((existingStudios || []).map(s => s.slug));

    // 5. Insérer les nouveaux studios (dédoublonnés par slug)
    const studioMap = new Map<string, any>();
    uniqueStudios.forEach(name => {
      const slug = createSlug(name);
      if (!existingStudioSlugs.has(slug) && !studioMap.has(slug)) {
        studioMap.set(slug, {
          id: `stu_${slug.replace(/-/g, "_")}_${Date.now().toString().slice(-4)}`,
          name,
          slug,
          aliases: [name.toLowerCase()]
        });
      }
    });
    const studiosToInsert = Array.from(studioMap.values());

    let stuCount = 0;
    if (studiosToInsert.length > 0) {
      const { error: insertStuError } = await supabaseAdmin.from("studios").insert(studiosToInsert);
      if (insertStuError) {
         console.error("Erreur insertion studios", insertStuError);
      } else {
         stuCount = studiosToInsert.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Référentiel initialisé : ${catCount} catégories et ${stuCount} studios ajoutés.`
    });

  } catch (err: unknown) {
    console.error("[Seed Referential API] Error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation du référentiel" },
      { status: 500 }
    );
  }
}

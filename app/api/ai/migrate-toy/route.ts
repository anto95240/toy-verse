import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { callGemini, parseGeminiJSON } from "@/lib/ai/gemini";
import { searchReferential } from "@/lib/supabase/referential";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { toyId, nom, categorieLegacy, studioLegacy, themeName, customFieldsDef } = await req.json();

    if (!toyId || !nom) {
      return NextResponse.json({ error: "toyId et nom requis" }, { status: 400 });
    }

    // Charger les listes de référentiel via Admin pour bypasser le RLS
    const supabaseAdmin = createSupabaseAdmin();
    const [
      { data: categories },
      { data: studios },
      { data: franchises },
      { data: licenses },
    ] = await Promise.all([
      supabaseAdmin.from("categories_v2").select("name").eq("active", true),
      supabaseAdmin.from("studios").select("name").eq("active", true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabaseAdmin as any).from("franchises").select("name").eq("active", true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabaseAdmin as any).from("licenses").select("name").eq("active", true),
    ]);

    const catNames = (categories || []).map((c) => c.name).join(", ");
    const stuNames = (studios || []).map((s) => s.name).join(", ");
    const fraNames = (franchises || []).map((f: { name: string }) => f.name).join(", ");
    const licNames = (licenses || []).map((l: { name: string }) => l.name).join(", ");

    let prompt = `Tu es un expert mondial en jouets de collection (Lego, Funko Pop, Figurines, Playmobil, Meccano, etc.).
Ton but est de classifier un ancien jouet vers un nouveau référentiel strict et d'extraire ses métadonnées.

Données de l'ancien jouet :
- Nom : "${nom}"
- Ancienne Catégorie (legacy V1) : "${categorieLegacy || ""}"
- Ancienne Marque/Studio (legacy V1) : "${studioLegacy || ""}"
- Thème de collection actuel : "${themeName || "Inconnu"}"

Catégories valides : ${catNames}
Studios valides : ${stuNames}
Franchises valides : ${fraNames}
Licences valides : ${licNames}
`;

    if (customFieldsDef && customFieldsDef.length > 0) {
      prompt += `\nCe thème a des champs personnalisés que tu dois aussi essayer de remplir si applicable :
${JSON.stringify(customFieldsDef, null, 2)}
`;
    }

    prompt += `
Instructions CRITIQUES :
1. RÈGLES THÈME (priorité absolue) :
   - Meccano / "Engineering & Robotics" → studio = Meccano ou Engineering & Robotics, catégorie Construction, sous-catégorie précise (Robot, Véhicule RC…)
   - Lego → studio LEGO, numéro de set + pièces si connus
   - Funko → studio Funko, personnage + franchise
   - Playmobil → studio Playmobil, numéro de set
   - Souvenir / Voyage → priorité catégorie + type (sous-cat) + lieu ; pas de studio/franchise inventés
2. L'ancienne catégorie/studio sont des indices FORTS (confiance 90+ si match proche).
3. Sous-catégories précises (jamais trop génériques).
4. Déduis métadonnées (numéro, pièces, année) seulement si tu es confiant — sinon null.
5. Ne invente pas : mieux null qu'une fausse valeur.

Réponds UNIQUEMENT avec un objet JSON strict :
{
  "category_name": "catégorie principale",
  "subcategory_name": "sous-catégorie précise ou null",
  "studio_name": "studio/marque ou null",
  "franchise_name": "franchise ou null",
  "license_name": "licence ou null",
  "character_names": [],
  "location_name": "lieu ou null",
  "numero": "référence ou null",
  "nb_pieces": null,
  "release_date": null,
  "taille": null,
  "custom_fields": {},
  "confidence": 95
}
`;

    const rawResponse = await callGemini(prompt);
    if (!rawResponse) {
      return NextResponse.json({ error: "L'IA est temporairement indisponible ou surchargée. Veuillez réessayer." }, { status: 503 });
    }

    const aiResult = parseGeminiJSON<{
      category_name: string | null;
      subcategory_name?: string | null;
      studio_name: string | null;
      franchise_name: string | null;
      license_name?: string | null;
      character_names: string[];
      location_name: string | null;
      numero?: string | null;
      nb_pieces?: number | null;
      release_date?: number | null;
      taille?: string | null;
      custom_fields?: Record<string, unknown>;
      confidence: number;
    }>(rawResponse);

    if (!aiResult) {
      return NextResponse.json({ error: "Impossible de lire la réponse de l'IA" }, { status: 500 });
    }

    // Résolution des noms en IDs (toujours avec Admin pour bypass RLS)
    const suggestions: any[] = [];
    const pushSuggestion = (entityType: string, id: string, name: string) => {
      // Déterminer le niveau de confiance
      const level = aiResult.confidence >= 90 ? "CERTAIN" : aiResult.confidence >= 60 ? "PROBABLE" : "UNKNOWN";
      suggestions.push({
        entityType,
        id,
        name,
        confidence: aiResult.confidence,
        level,
        source: "ai",
      });
    };

    if (aiResult.category_name) {
      const hits = await searchReferential(supabaseAdmin, "category", aiResult.category_name, 1);
      if (hits.length > 0) pushSuggestion("category", hits[0].id, hits[0].name);
    }
    if (aiResult.subcategory_name) {
      const hits = await searchReferential(supabaseAdmin, "category", aiResult.subcategory_name, 1);
      if (hits.length > 0) pushSuggestion("subcategory", hits[0].id, hits[0].name);
    }
    if (aiResult.studio_name) {
      const hits = await searchReferential(supabaseAdmin, "studio", aiResult.studio_name, 1);
      if (hits.length > 0) pushSuggestion("studio", hits[0].id, hits[0].name);
    }
    if (aiResult.franchise_name) {
      const hits = await searchReferential(supabaseAdmin, "franchise", aiResult.franchise_name, 1);
      if (hits.length > 0) pushSuggestion("franchise", hits[0].id, hits[0].name);
    }
    if (aiResult.license_name) {
      const hits = await searchReferential(supabaseAdmin, "license", aiResult.license_name, 1);
      if (hits.length > 0) pushSuggestion("license", hits[0].id, hits[0].name);
    }
    for (const charName of (aiResult.character_names || [])) {
      const hits = await searchReferential(supabaseAdmin, "character", charName, 1);
      if (hits.length > 0) pushSuggestion("character", hits[0].id, hits[0].name);
    }
    if (aiResult.location_name) {
      const hits = await searchReferential(supabaseAdmin, "location", aiResult.location_name, 1);
      if (hits.length > 0) pushSuggestion("location", hits[0].id, hits[0].name);
    }

    return NextResponse.json({ 
      suggestions,
      metadata: {
        numero: aiResult.numero || null,
        nb_pieces: aiResult.nb_pieces || null,
        release_date: aiResult.release_date || null,
        taille: aiResult.taille || null,
      },
      custom_fields: aiResult.custom_fields || undefined,
    });
  } catch (err) {
    console.error("[POST /api/ai/migrate-toy] Erreur:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

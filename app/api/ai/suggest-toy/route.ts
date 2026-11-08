import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { callGemini, parseGeminiJSON } from "@/lib/ai/gemini";
import { listFranchiseLabels, pickByNameOrAlias, searchReferential } from "@/lib/supabase/referential";

// Règles d'association thème-spécifiques pour guider l'IA
const THEME_RULES: Record<string, string> = {
  meccano: `
RÈGLES MECCANO (TRÈS IMPORTANTES) :
- Le studio/fabricant est TOUJOURS "Engineering & Robotics" (ou "Meccano" selon les listes disponibles)
- La catégorie principale est "Jeux de construction" ou "Construction"
- Les sous-catégories possibles : "Véhicule radiocommandé", "Robot", "Set de construction", "Véhicule motorisé"
- La franchise peut être "Meccano" ou "Mecano"
- Si l'ancien studio contient "Engineering & Robotics", c'est une certitude absolue (confiance 99)
`,
  lego: `
RÈGLES LEGO (TRÈS IMPORTANTES) :
- Le studio/fabricant est TOUJOURS "The LEGO Group" ou "LEGO"
- La catégorie principale est "Lego" ou "Jeux de construction"
- Utilise ta base de connaissances mondiales pour identifier la gamme exacte (Technic, City, Creator, Icons, Ideas...)
- La franchise (univers) est obligatoire dès qu'elle est identifiable : Star Wars, Harry Potter, Marvel, DC, Ninjago, etc.
- Ne mets PAS la gamme (City, Technic, Creator) en franchise : c'est une sous-catégorie. Le fabricant reste le studio.
- Déduis le numéro de set exact si possible (ex: "La cérémonie du Choixpeau" = set 76429)
`,
  funko: `
RÈGLES FUNKO POP (TRÈS IMPORTANTES) :
- Le studio/fabricant est TOUJOURS "Funko"
- La catégorie principale est "Figurine à collectionner" ou "Funko Pop"
- Le numéro dans la série Funko est crucial — identifie-le si possible
- Identifie précisément le personnage et sa franchise (univers : Marvel, Star Wars, Disney…). La franchise est un champ à part, distinct du studio Funko.
`,
  playmobil: `
RÈGLES PLAYMOBIL (TRÈS IMPORTANTES) :
- Le studio/fabricant est TOUJOURS "Playmobil" ou "Playmobil GmbH"
- La catégorie principale est "Playmobil" ou "Jeux de construction"
- Identifie le numéro de set si possible
`,
  puzzle: `
RÈGLES PUZZLE (TRÈS IMPORTANTES) :
- Le nombre de pièces est l'information principale
- Identifie l'éditeur (Ravensburger, Nathan, Clementoni, Trefl...)
- La franchise est l'univers représenté (Disney, Harry Potter, Star Wars…) quand il est clair, sinon null
`,
  souvenir: `
RÈGLES SOUVENIR / VOYAGE (TRÈS IMPORTANTES) :
- Priorité absolue : catégorie (Souvenir…), sous-catégorie (Phare, Magnet…) et lieu d'achat/provenance
- Ne propose PAS de studio, franchise ou personnage sauf évidence extrême
- Le lieu doit être précis (ville, région, parc) plutôt que générique
`,
};

function getThemeRules(themeName: string): string {
  if (!themeName) return "";
  const norm = themeName.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  
  if (norm.includes("meccano") || norm.includes("mecano") || norm.includes("construction")) {
    return THEME_RULES.meccano;
  }
  if (norm.includes("lego")) return THEME_RULES.lego;
  if (norm.includes("funko") || norm.includes("pop")) return THEME_RULES.funko;
  if (norm.includes("playmobil")) return THEME_RULES.playmobil;
  if (norm.includes("puzzle")) return THEME_RULES.puzzle;
  if (norm.includes("souvenir") || norm.includes("voyage") || norm.includes("phare")) {
    return THEME_RULES.souvenir;
  }
  return "";
}

function normName(s: string | null | undefined): string {
  return (s || "").trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function sameValue(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normName(a) === normName(b);
}


export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const {
      toyName,
      themeName,
      imageBase64,
      customFieldsDef,
      categorieLegacy,
      studioLegacy,
      currentValues,
    } = await req.json();

    if (!toyName && !imageBase64) {
      return NextResponse.json({ error: "toyName ou imageBase64 requis" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    const [
      { data: categories },
      { data: studios },
      franchises,
    ] = await Promise.all([
      supabaseAdmin.from("categories_v2").select("name").eq("active", true),
      supabaseAdmin.from("studios").select("name").eq("active", true),
      listFranchiseLabels(supabaseAdmin),
    ]);

    const catNames = (categories || []).map((c) => c.name).join(", ");
    const stuNames = (studios || []).map((s) => s.name).join(", ");
    const fraNames = franchises.map((f) => {
      const aliases = f.aliases.filter(Boolean);
      return aliases.length ? `${f.name} [alias: ${aliases.join(", ")}]` : f.name;
    }).join(", ");

    // Règles thème-spécifiques
    const themeRules = getThemeRules(themeName || "");

    let prompt = `Tu es un expert mondial en jouets de collection (Lego, Funko Pop, Figurines, Playmobil, Meccano, etc.).
Ton but est de classifier un jouet ou d'analyser son image et de pré-remplir le maximum de détails avec une précision maximale.

Données fournies :
- Nom saisi par l'utilisateur : "${toyName || "Inconnu"}"
- Thème de collection : "${themeName || ""}"`;

    // Ajouter les données legacy si disponibles (mode édition)
    if (categorieLegacy || studioLegacy) {
      prompt += `
- Ancienne catégorie (legacy V1) : "${categorieLegacy || ""}"
- Ancien studio/marque (legacy V1) : "${studioLegacy || ""}"
IMPORTANT : Utilise les données legacy comme indices forts pour tes déductions.
Si l'ancien studio correspond exactement à un studio ou une franchise connu, indique une confiance de 95+.`;
    }

    prompt += `

Catégories valides : ${catNames}
Studios valides : ${stuNames}
Franchises valides (univers / série) : ${fraNames}
`;

    if (themeRules) {
      prompt += `\n${themeRules}\n`;
    }

    if (customFieldsDef && customFieldsDef.length > 0) {
      prompt += `\nCe thème a des champs personnalisés que tu dois aussi essayer de remplir si applicable :
${JSON.stringify(customFieldsDef, null, 2)}
`;
    }

    if (currentValues) {
      prompt += `
Valeurs déjà renseignées (NE LES RÉPÈTE PAS si tu propose la même chose — mets null à la place) :
${JSON.stringify(currentValues, null, 2)}
IMPORTANT : ne renvoie une valeur que si elle est ABSENTE, INCORRECTE ou clairement améliorée. Sinon null.
`;
    }

    prompt += `
Instructions générales :
1. Sois expert et précis : déduis catégorie, sous-catégorie, studio, franchise, métadonnées avec certitude quand c'est évident.
2. FRANCHISE : univers du jouet. Distinct du studio (fabricant) et de la gamme (sous-catégorie).
   La liste indique le nom à renvoyer, et entre crochets les alias (Jurassic Park, Jurassic World, JP, JW → nom « Jurassic Park / Jurassic World »).
   franchise_name doit être le NOM PRINCIPAL, jamais un alias. Si aucun univers ne correspond, null.
3. Priorise les champs utiles au thème (voir règles thème). Pour un souvenir → lieu + type ; pour Meccano → cat/sous-cat/studio/numéro ; pour Lego, Funko, figurine, Pop → franchise dès qu'un univers est clair.
4. Sous-catégories précises (ex: "Voiture télécommandée" plutôt que "Véhicule").
5. Si une entité n'est pas dans la liste mais est une évidence, inclus-la.
6. Utilise tes connaissances (numéro de set, pièces, année) — mais ne invente pas au hasard : confiance basse (<70) si doute.
7. Ne renvoie PAS les mêmes valeurs que "déjà renseignées".
`;

    if (imageBase64) {
      prompt += `Agis comme Google Lens. Analyse la photo de ce jouet. Identifie le type exact, la marque, la franchise (univers) et le(s) personnage(s). Si le "Nom saisi" est Inconnu ou trop vague, propose un "suggested_name" précis. Utilise tes connaissances mondiales pour déduire les métadonnées exactes (numéro de set, nombre de pièces, année de sortie, etc.) du jouet photographié, même si ces informations ne sont pas visibles.
`;
    } else {
      prompt += `Analyse le "Nom saisi" dans le contexte du "Thème de collection" ET des données legacy. Grâce à ta base de connaissances, identifie exactement de quel jouet il s'agit. Remplis avec précision le numéro de set/modèle, le nombre de pièces, l'année de sortie et toutes les entités appropriées.
`;
    }

    prompt += `
Réponds UNIQUEMENT avec un objet JSON strict de cette forme :
{
  "suggested_name": "Nom complet suggéré (optionnel, seulement si pertinent de l'améliorer)",
  "category_name": "nom exact ou suggéré de la catégorie",
  "studio_name": "nom exact ou suggéré du studio/marque",
  "franchise_name": "univers / franchise (ex: Star Wars) ou null",
  "character_names": ["Personnage 1", "Personnage 2"] (ou liste vide []),
  "location_name": "Lieu pertinent ou null",
  "numero": "Numéro de set ou référence (si détecté) ou null",
  "nb_pieces": 100 (nombre entier ou null),
  "release_date": 2023 (année entière ou null),
  "taille": "Echelle ou taille ou null",
  "custom_fields": { "id_du_champ": "valeur déduite" } (uniquement avec les IDs définis ci-dessus, sinon {}),
  "confidence": 95
}`;

    const rawResponse = await callGemini(prompt, imageBase64);
    if (!rawResponse) {
      return NextResponse.json({ error: "L'IA est temporairement indisponible ou surchargée. Veuillez réessayer." }, { status: 503 });
    }

    const aiResult = parseGeminiJSON<{
      suggested_name: string | null;
      category_name: string | null;
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

    const suggestions: any[] = [];
    const pushSuggestion = (entityType: string, id: string, name: string, slug: string) => {
      suggestions.push({
        entityType,
        id,
        name,
        slug,
        confidence: aiResult.confidence,
        source: "ai",
      });
    };

    if (aiResult.category_name && !sameValue(aiResult.category_name, currentValues?.category)) {
      const hits = await searchReferential(supabaseAdmin, "category", aiResult.category_name, 1);
      if (hits.length > 0) pushSuggestion("category", hits[0].id, hits[0].name, hits[0].slug);
    }
    if (aiResult.studio_name && !sameValue(aiResult.studio_name, currentValues?.studio)) {
      const hits = await searchReferential(supabaseAdmin, "studio", aiResult.studio_name, 1);
      if (hits.length > 0) pushSuggestion("studio", hits[0].id, hits[0].name, hits[0].slug);
    }
    const franchiseQuery = aiResult.franchise_name || aiResult.license_name;
    if (franchiseQuery && !sameValue(franchiseQuery, currentValues?.franchise)) {
      const hits = await searchReferential(supabaseAdmin, "franchise", franchiseQuery, 8);
      const picked = pickByNameOrAlias(hits, franchiseQuery);
      if (picked) pushSuggestion("franchise", picked.id, picked.name, picked.slug);
    }
    const existingChars = new Set((currentValues?.characters || []).map((c: string) => normName(c)));
    for (const charName of aiResult.character_names || []) {
      if (existingChars.has(normName(charName))) continue;
      const hits = await searchReferential(supabaseAdmin, "character", charName, 1);
      if (hits.length > 0) pushSuggestion("character", hits[0].id, hits[0].name, hits[0].slug);
    }
    if (aiResult.location_name && !sameValue(aiResult.location_name, currentValues?.location)) {
      const hits = await searchReferential(supabaseAdmin, "location", aiResult.location_name, 1);
      if (hits.length > 0) pushSuggestion("location", hits[0].id, hits[0].name, hits[0].slug);
    }

    const metadata = {
      numero:
        aiResult.numero && !sameValue(aiResult.numero, currentValues?.numero)
          ? aiResult.numero
          : null,
      nb_pieces:
        aiResult.nb_pieces != null && aiResult.nb_pieces !== currentValues?.nb_pieces
          ? aiResult.nb_pieces
          : null,
      release_date:
        aiResult.release_date != null && aiResult.release_date !== currentValues?.release_date
          ? aiResult.release_date
          : null,
      taille:
        aiResult.taille && !sameValue(aiResult.taille, currentValues?.taille)
          ? aiResult.taille
          : null,
    };

    const hasMeta = Object.values(metadata).some((v) => v !== null);
    if (suggestions.length === 0 && !hasMeta && !aiResult.custom_fields) {
      return NextResponse.json({ unchanged: true, suggestions: [], metadata: null });
    }

    return NextResponse.json({
      suggestions,
      suggestedName: aiResult.suggested_name || undefined,
      metadata: hasMeta ? metadata : null,
      custom_fields: aiResult.custom_fields || undefined,
    });
  } catch (err) {
    console.error("[POST /api/ai/suggest-toy] Erreur:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

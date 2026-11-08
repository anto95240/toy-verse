import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

// =============================================================================
// TYPES
// =============================================================================

type ConfidenceLevel = "CERTAIN" | "PROBABLE" | "UNKNOWN";

type DBEntity = {
  id: string;
  name: string;
  slug: string;
  aliases: string[] | null;
};

type ToyAnalysis = {
  toyId: string;
  nom: string;
  themeId: string;
  legacy: {
    categorie: string | null;
    studio: string;
  };
  suggestions: {
    entityType: string;
    id: string;
    name: string;
    confidence: number;
    level: ConfidenceLevel;
    source: string;
  }[];
  status: "auto-migrable" | "needs-review" | "unresolved" | "migrated";
  v2_data?: {
    category_ids: { id: string; name: string }[];
    studio_ids: { id: string; name: string }[];
    license_ids: { id: string; name: string }[];
    franchise_ids: { id: string; name: string }[];
    character_ids: { id: string; name: string }[];
    location_ids: { id: string; name: string }[];
  };
  themeName?: string;
  customFieldsDef?: any[];
  storedLicense?: { id: string; name: string } | null;
  storedFranchise?: { id: string; name: string } | null;
  /** Franchise du référentiel dont le nom est celui de la licence, sinon null (à créer). */
  licenseFranchise?: { id: string; name: string } | null;
  metadata?: {
    numero?: string;
    nb_pieces?: number;
    taille?: string;
    release_date?: string;
    gift_occasion?: string | null;
    gift_year?: number | null;
  };
  custom_fields?: any;
};

// =============================================================================
// NORMALISATION UNICODE — supprime accents, minuscule, trim
// =============================================================================

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =============================================================================
// MOTEUR DE MATCHING FUZZY
// Score 0-100 + clé qui a matché
// =============================================================================

type MatchResult = { score: number; matchedOn: string };

function matchEntity(entity: DBEntity, searchStr: string): MatchResult | null {
  if (!searchStr || searchStr.length < 2) return null;
  const normSearch = normalize(searchStr);
  const normName = normalize(entity.name);
  const aliases = (entity.aliases ?? []).map(normalize).filter((a) => a.length >= 2);

  // 1. Correspondance exacte sur le nom
  if (normName === normSearch) return { score: 100, matchedOn: "name-exact" };

  // 2. Correspondance exacte sur un alias
  for (const alias of aliases) {
    if (alias === normSearch) return { score: 98, matchedOn: `alias-exact:${alias}` };
  }

  // 3. Le texte de recherche contient exactement le nom de l'entité
  if (normName.length >= 3 && normSearch.includes(normName)) {
    const ratio = normName.length / normSearch.length;
    return { score: Math.min(Math.round(85 + ratio * 10), 95), matchedOn: "name-in-search" };
  }

  // 4. Le texte de recherche contient un alias de l'entité
  for (const alias of aliases) {
    if (alias.length >= 3 && normSearch.includes(alias)) {
      const ratio = alias.length / normSearch.length;
      return { score: Math.min(Math.round(75 + ratio * 10), 90), matchedOn: `alias-in-search:${alias}` };
    }
  }

  // 5. Le nom de l'entité contient le texte de recherche (partial match)
  if (normSearch.length >= 3 && normName.includes(normSearch)) {
    return { score: 68, matchedOn: "search-in-name" };
  }

  // 6. Un alias de l'entité contient le texte de recherche
  for (const alias of aliases) {
    if (normSearch.length >= 4 && alias.includes(normSearch)) {
      return { score: 62, matchedOn: `search-in-alias:${alias}` };
    }
  }

  return null;
}

function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 90) return "CERTAIN";
  if (confidence >= 60) return "PROBABLE";
  return "UNKNOWN";
}

// =============================================================================
// BANQUE D'ENTITÉS
// =============================================================================

type EntityBank = {
  categories: DBEntity[];
  studios: DBEntity[];
  licenses: DBEntity[];
  franchises: DBEntity[];
  characters: DBEntity[];
  locations: DBEntity[];
};

type SuggestionEntry = ToyAnalysis["suggestions"][number];

// =============================================================================
// ANALYSE D'UN JOUET — cœur de l'algorithme amélioré
// =============================================================================

function analyzeToy(
  toy: {
    id: string;
    nom: string;
    theme_id: string;
    categorie: string | null;
    studio: string | null;
    themes: { name: string } | null;
  },
  bank: EntityBank
): SuggestionEntry[] {
  const suggestions: SuggestionEntry[] = [];
  const seenIds = new Map<string, number>(); // id → index in suggestions

  const addSuggestion = (
    entityType: string,
    entity: DBEntity,
    confidence: number,
    source: string
  ) => {
    const existingIdx = seenIds.get(entity.id);
    if (existingIdx !== undefined) {
      // Garder le meilleur score
      if (suggestions[existingIdx].confidence < confidence) {
        suggestions[existingIdx].confidence = confidence;
        suggestions[existingIdx].level = getConfidenceLevel(confidence);
        suggestions[existingIdx].source = source;
      }
      return;
    }
    seenIds.set(entity.id, suggestions.length);
    suggestions.push({
      entityType,
      id: entity.id,
      name: entity.name,
      confidence,
      level: getConfidenceLevel(confidence),
      source,
    });
  };

  const nomStr = (toy.nom || "").trim();
  const catStr = (toy.categorie || "").trim();
  const studioStr = (toy.studio || "").trim();
  const themeStr = (toy.themes?.name || "").trim();
  const fullText = `${nomStr} ${catStr} ${studioStr} ${themeStr}`;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CATÉGORIES
  // Priorité : catStr > fullText
  // ─────────────────────────────────────────────────────────────────────────
  if (catStr) {
    for (const cat of bank.categories) {
      const m = matchEntity(cat, catStr);
      if (m) addSuggestion("category", cat, m.score, `Catégorie legacy "${catStr}" (${m.matchedOn})`);
    }
  }

  // Si pas de catégorie trouvée, chercher dans nom + thème
  const hasCategoryYet = () => suggestions.some((s) => s.entityType === "category");

  if (!hasCategoryYet()) {
    for (const cat of bank.categories) {
      // Cherche d'abord dans nom seul
      const mNom = matchEntity(cat, nomStr);
      if (mNom && mNom.score >= 80) {
        addSuggestion("category", cat, Math.min(mNom.score, 90), `Déduit du nom du jouet (${mNom.matchedOn})`);
        continue;
      }
      // Puis dans le texte complet
      const mFull = matchEntity(cat, fullText);
      if (mFull && mFull.score >= 80) {
        addSuggestion("category", cat, Math.min(mFull.score, 85), `Déduit du texte complet (${mFull.matchedOn})`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. STUDIOS
  // Matching sur studioStr, puis sur nom et thème si rien trouvé
  // ─────────────────────────────────────────────────────────────────────────
  if (studioStr) {
    for (const studio of bank.studios) {
      const m = matchEntity(studio, studioStr);
      if (m) addSuggestion("studio", studio, m.score, `Studio legacy "${studioStr}" (${m.matchedOn})`);
    }
  }

  // Tentative de détecter le studio depuis le nom du jouet (ex: "Lego Star Wars")
  if (!suggestions.some((s) => s.entityType === "studio")) {
    for (const studio of bank.studios) {
      const m = matchEntity(studio, nomStr);
      if (m && m.score >= 82) {
        addSuggestion("studio", studio, Math.min(m.score, 88), `Studio déduit du nom (${m.matchedOn})`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. FRANCHISES
  // Matching sur plusieurs sources
  // ─────────────────────────────────────────────────────────────────────────
  const franchiseSources = [
    { text: studioStr, weight: 1.0, label: "studio legacy" },
    { text: catStr, weight: 0.95, label: "catégorie legacy" },
    { text: nomStr, weight: 0.9, label: "nom du jouet" },
    { text: themeStr, weight: 0.85, label: "thème" },
  ].filter((s) => s.text.length > 0);

  for (const franchise of bank.franchises) {
    let bestScore = 0;
    let bestSource = "";
    for (const src of franchiseSources) {
      const m = matchEntity(franchise, src.text);
      if (m) {
        const weighted = Math.round(m.score * src.weight);
        if (weighted > bestScore) {
          bestScore = weighted;
          bestSource = `Franchise "${franchise.name}" ← ${src.label} "${src.text}" (${m.matchedOn})`;
        }
      }
    }
    if (bestScore >= 65) addSuggestion("franchise", franchise, bestScore, bestSource);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. PERSONNAGES — matching prioritaire sur le nom du jouet
  // ─────────────────────────────────────────────────────────────────────────
  for (const character of bank.characters) {
    const m = matchEntity(character, nomStr);
    if (m && m.score >= 70) {
      addSuggestion("character", character, m.score, `Personnage "${character.name}" ← nom "${nomStr}" (${m.matchedOn})`);
      continue;
    }
    // Fallback sur fullText
    const mFull = matchEntity(character, fullText);
    if (mFull && mFull.score >= 78) {
      addSuggestion("character", character, Math.min(mFull.score, 85), `Personnage déduit du texte complet`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. LIEUX — souvent dans le champ studio legacy ("Disneyland", "Bretagne"…)
  // ─────────────────────────────────────────────────────────────────────────
  const locationSources = [studioStr, catStr].filter(Boolean);
  for (const location of bank.locations) {
    for (const src of locationSources) {
      const m = matchEntity(location, src);
      if (m && m.score >= 70) {
        addSuggestion("location", location, m.score, `Lieu "${location.name}" ← "${src}" (${m.matchedOn})`);
        break;
      }
    }
  }

  // Trier par confiance décroissante
  suggestions.sort((a, b) => b.confidence - a.confidence);

  return suggestions;
}

// =============================================================================
// ROUTE GET
// =============================================================================

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdmin();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const toyColumns = [
      "id", "nom", "theme_id", "categorie", "studio",
      "category_ids", "studio_ids", "license_ids", "franchise_ids", "character_ids", "location_ids",
      "numero", "nb_pieces", "taille", "release_date", "gift_occasion", "gift_year",
      "custom_fields_values", "user_id",
    ];

    async function loadToys() {
      const columns = [...toyColumns];
      for (let attempt = 0; attempt < 4; attempt++) {
        const result = await (supabase as any)
          .from("toys")
          .select(columns.join(", "))
          .eq("user_id", user.id);
        if (!result.error) return result;
        const message = String(result.error.message || "");
        const missing =
          message.match(/column toys\.(\w+) does not exist/i)?.[1] ||
          message.match(/Could not find the '(\w+)' column/i)?.[1];
        if (!missing || !columns.includes(missing)) return result;
        console.warn(`[Migration Report API] Colonne absente, ignorée : ${missing}`);
        columns.splice(columns.indexOf(missing), 1);
      }
      return (supabase as any).from("toys").select(toyColumns.filter((c) => c !== "gift_occasion" && c !== "gift_year").join(", ")).eq("user_id", user.id);
    }

    // Chargement parallèle
    const [
      { data: toys, error },
      { data: categories },
      { data: studios },
      { data: licenses },
      franchises,
      { data: characters },
      { data: locations },
      { data: themeProfiles },
      { data: themesList },
    ] = await Promise.all([
      loadToys(),
      supabaseAdmin.from("categories_v2").select("id, name, slug, aliases, active").eq("active", true),
      supabaseAdmin.from("studios").select("id, name, slug, aliases, active").eq("active", true),
      supabaseAdmin.from("licenses").select("id, name, slug, aliases, active").eq("active", true),
      loadFranchises(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabaseAdmin as any).from("characters").select("id, name, slug, active").eq("active", true),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabaseAdmin as any).from("locations").select("id, name, slug, active").eq("active", true),
      supabaseAdmin.from("theme_profiles").select("id, label, custom_fields_definition, primary_fields, details_first_fields, hidden_fields"),
      supabaseAdmin.from("themes").select("id, name, profile_id").eq("user_id", user.id),
    ]);

    if (error) throw error;

    async function loadFranchises() {
      const withAliases = await supabaseAdmin
        .from("franchises")
        .select("id, name, slug, aliases, active")
        .eq("active", true);
      if (!withAliases.error) return withAliases.data ?? [];
      if (/aliases/i.test(withAliases.error.message || "")) {
        const plain = await (supabaseAdmin as any).from("franchises").select("id, name, slug, active").eq("active", true);
        return ((plain.data ?? []) as { id: string; name: string; slug: string }[]).map((row) => ({ ...row, aliases: [] as string[] }));
      }
      return [];
    }

    type SimpleEntity = { id: string; name: string; slug: string };
    const toDBEntity = (arr: SimpleEntity[]): DBEntity[] => arr.map((e) => ({ ...e, aliases: null }));

    const bank: EntityBank = {
      categories: (categories ?? []) as DBEntity[],
      studios: (studios ?? []) as DBEntity[],
      licenses: (licenses ?? []) as DBEntity[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      franchises: ((franchises ?? []) as DBEntity[]).map((f) => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        aliases: f.aliases ?? [],
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      characters: toDBEntity((characters ?? []) as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locations:  toDBEntity((locations  ?? []) as any),
    };

    const resolveEntities = (ids: string[] | null, entities: DBEntity[]) => {
      if (!ids || !entities) return [];
      return ids
        .map((id) => entities.find((e) => e.id === id))
        .filter(Boolean)
        .map((e) => ({ id: e!.id, name: e!.name }));
    };

    let alreadyMigrated = 0;
    const results: ToyAnalysis[] = [];

    for (const toy of toys ?? []) {
      const validCategoryIds = (toy.category_ids ?? []).filter(Boolean);
      const isMigrated = validCategoryIds.length > 0;
      if (isMigrated) alreadyMigrated++;

      const toyNormalized = {
        id: toy.id,
        nom: toy.nom || "",
        theme_id: toy.theme_id,
        categorie: toy.categorie,
        studio: toy.studio,
        themes: null,
      };

      // Analyse heuristique de base (matching fuzzy sur les entités du référentiel)
      let suggestions: any[] = analyzeToy(toyNormalized, bank);

      // ── BOOST : règles thème-spécifiques ──────────────────────────────────
      // Si le studio legacy = "Engineering & Robotics" → chercher le studio correspondant
      const studioLower = (toy.studio || "").toLowerCase();
      const catLower = (toy.categorie || "").toLowerCase();
      const themeNameLower = (themesList as any[])?.find(t => t.id === toy.theme_id)?.name?.toLowerCase() || "";

      const isMeccano = studioLower.includes("engineering") || studioLower.includes("robotics") ||
        themeNameLower.includes("meccano") || catLower.includes("meccano");
      const isLego = themeNameLower.includes("lego") || studioLower.includes("lego") || catLower.includes("lego");
      const isFunko = themeNameLower.includes("funko") || studioLower.includes("funko") || catLower.includes("funko");
      const isPlaymobil = themeNameLower.includes("playmobil") || studioLower.includes("playmobil");

      if (isMeccano || isLego || isFunko || isPlaymobil) {
        // Chercher le studio dans la banque et booster la confiance
        const targetStudio = isMeccano ? ["engineering", "robotics", "meccano"] :
                             isLego    ? ["lego"] :
                             isFunko   ? ["funko"] : ["playmobil"];
        for (const studio of bank.studios) {
          const sNorm = normalize(studio.name);
          if (targetStudio.some(t => sNorm.includes(t))) {
            // Trouver la suggestion existante ou en ajouter une nouvelle
            const existingSugg = suggestions.find(s => s.entityType === "studio" && s.id === studio.id);
            if (existingSugg) {
              existingSugg.confidence = Math.max(existingSugg.confidence, 97);
              existingSugg.level = "CERTAIN";
              existingSugg.source = "R\u00e8gle th\u00e8me-sp\u00e9cifique";
            } else {
              suggestions.push({
                entityType: "studio",
                id: studio.id,
                name: studio.name,
                confidence: 97,
                level: "CERTAIN" as ConfidenceLevel,
                source: "R\u00e8gle th\u00e8me-sp\u00e9cifique",
              });
            }
            break;
          }
        }
        // Chercher la catégorie construction / jouet de construction
        if (isMeccano && !suggestions.some(s => s.entityType === "category" && s.level === "CERTAIN")) {
          for (const cat of bank.categories) {
            if (normalize(cat.name).includes("construct")) {
              suggestions.push({
                entityType: "category",
                id: cat.id,
                name: cat.name,
                confidence: 90,
                level: "CERTAIN" as ConfidenceLevel,
                source: "R\u00e8gle th\u00e8me-sp\u00e9cifique (Meccano)",
              });
              break;
            }
          }
        }
      }

      // Re-trier par confiance
      suggestions.sort((a, b) => b.confidence - a.confidence);

      const hasCertain = suggestions.some((s) => s.level === "CERTAIN");
      const hasProbable = suggestions.some((s) => s.level === "PROBABLE");
      const allCertain = suggestions.length > 0 && suggestions.every((s) => s.level === "CERTAIN");
      const hasCategory = suggestions.some((s) => s.entityType === "category" && s.level === "CERTAIN");

      let status: ToyAnalysis["status"];
      if (isMigrated) {
        status = "migrated";
      } else if (allCertain && hasCategory) {
        status = "auto-migrable";
      } else if (hasCertain || hasProbable) {
        status = "needs-review";
      } else {
        status = "unresolved";
      }

      const storedLicense = resolveEntities(toy.license_ids, bank.licenses)[0] ?? null;
      const storedFranchise = resolveEntities(toy.franchise_ids, bank.franchises)[0] ?? null;
      const licenseFranchise = storedLicense
        ? bank.franchises.find((f) => {
            const target = normalize(storedLicense.name);
            return normalize(f.name) === target || (f.aliases ?? []).some((alias) => normalize(alias) === target);
          }) ?? null
        : null;
      if (storedLicense && status === "migrated") status = "needs-review";

      // -- Résolution du thème --
      let themeName = toy.theme_id || "";
      let customFieldsDef: any[] = [];
      
      const themeObj = (themesList as any[])?.find(t => t.id === toy.theme_id);
      if (themeObj) {
        themeName = themeObj.name;
        if (themeObj.profile_id) {
          const profile = (themeProfiles as any[])?.find(p => p.id === themeObj.profile_id);
          if (profile) {
            customFieldsDef = profile.custom_fields_definition || [];
          }
        }
      } else {
        // Fallback pour les jouets migrés avec des UUID qui n'existent plus ou des hardcodés
        if (toy.theme_id === "lego") themeName = "Lego";
        else if (toy.theme_id === "funko_pop") themeName = "Funko Pop";
        else if (toy.theme_id === "figurines") themeName = "Figurines";
        else if (toy.theme_id === "playmobil") themeName = "Playmobil";
      }

      results.push({
        toyId: toy.id,
        nom: toy.nom,
        themeId: toy.theme_id,
        themeName,
        customFieldsDef,
        storedLicense: storedLicense ? { id: storedLicense.id, name: storedLicense.name } : null,
        storedFranchise: storedFranchise ? { id: storedFranchise.id, name: storedFranchise.name } : null,
        licenseFranchise: licenseFranchise ? { id: licenseFranchise.id, name: licenseFranchise.name } : null,
        legacy: { categorie: toy.categorie, studio: toy.studio },
        suggestions,
        metadata: {
          numero: (toy as any).numero,
          nb_pieces: (toy as any).nb_pieces,
          taille: (toy as any).taille,
          release_date: (toy as any).release_date,
          gift_occasion: (toy as any).gift_occasion,
          gift_year: (toy as any).gift_year,
        },
        custom_fields: (toy as any).custom_fields_values || undefined,
        status,
        v2_data: isMigrated
          ? {
              category_ids: resolveEntities(toy.category_ids, bank.categories),
              studio_ids: resolveEntities(toy.studio_ids, bank.studios),
              license_ids: resolveEntities(toy.license_ids, bank.licenses),
              franchise_ids: resolveEntities(toy.franchise_ids, bank.franchises),
              character_ids: resolveEntities(toy.character_ids, bank.characters),
              location_ids: resolveEntities(toy.location_ids, bank.locations),
            }
          : undefined,
      });
    }

    const stats = {
      total: (toys ?? []).length,
      alreadyMigrated,
      toAnalyze: results.length,
      autoMigrable: results.filter((r) => r.status === "auto-migrable").length,
      needsReview: results.filter((r) => r.status === "needs-review").length,
      unresolved: results.filter((r) => r.status === "unresolved").length,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ stats, toys: results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    console.error("[Migration Report API] Error:", err);
    return NextResponse.json({ error: "Erreur interne", details: message }, { status: 500 });
  }
}


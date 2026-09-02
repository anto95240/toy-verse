import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// =============================================================================
// DICTIONNAIRE DE CORRESPONDANCE LEGACY → V2
// =============================================================================

type MatchEntry = {
  entityType: "category" | "studio" | "license" | "franchise" | "character" | "location";
  id: string;
  name: string;
  confidence: number;
};

const LEGACY_CATEGORY_MAP: Record<string, MatchEntry> = {
  "figurine":              { entityType: "category", id: "cat_figurine",           name: "Figurine",           confidence: 100 },
  "figurines":             { entityType: "category", id: "cat_figurine",           name: "Figurine",           confidence: 95  },
  "figure":                { entityType: "category", id: "cat_figurine",           name: "Figurine",           confidence: 90  },
  "figurine articulée":    { entityType: "category", id: "cat_figurine_articulee", name: "Figurine articulée", confidence: 100 },
  "peluche":               { entityType: "category", id: "cat_peluche",            name: "Peluche",            confidence: 100 },
  "véhicule":              { entityType: "category", id: "cat_vehicule",           name: "Véhicule",           confidence: 100 },
  "vehicule":              { entityType: "category", id: "cat_vehicule",           name: "Véhicule",           confidence: 95  },
  "jeu":                   { entityType: "category", id: "cat_jeu",               name: "Jeu",                confidence: 100 },
  "construction":          { entityType: "category", id: "cat_construction",       name: "Construction",       confidence: 100 },
  "phare":                 { entityType: "category", id: "cat_phare",             name: "Phare",              confidence: 100 },
};

const LEGACY_STUDIO_MAP: Record<string, MatchEntry[]> = {
  "pixar":          [{ entityType: "studio",    id: "studio_pixar",        name: "Pixar",      confidence: 100 }],
  "disney":         [{ entityType: "studio",    id: "studio_disney",       name: "Disney",     confidence: 100 }],
  "disney pixar":   [
    { entityType: "studio",    id: "studio_disney",       name: "Disney",     confidence: 90 },
    { entityType: "studio",    id: "studio_pixar",        name: "Pixar",      confidence: 90 },
  ],
  "marvel":         [{ entityType: "studio",    id: "studio_marvel",       name: "Marvel",     confidence: 100 }],
  "star wars":      [{ entityType: "franchise", id: "franchise_star_wars", name: "Star Wars",  confidence: 95  }],
  "toy story":      [{ entityType: "franchise", id: "franchise_toy_story", name: "Toy Story",  confidence: 100 }],
  "harry potter":   [{ entityType: "franchise", id: "franchise_hp",        name: "Harry Potter", confidence: 100 }],
  "jurassic park":  [{ entityType: "franchise", id: "franchise_jp",        name: "Jurassic Park", confidence: 100 }],
  "bretagne":       [{ entityType: "location",  id: "location_bretagne",   name: "Bretagne",   confidence: 95  }],
  "disneyland":     [{ entityType: "location",  id: "location_dlp",        name: "Disneyland Paris", confidence: 85 }],
  "disneyland paris": [{ entityType: "location", id: "location_dlp",       name: "Disneyland Paris", confidence: 100 }],
};

type ConfidenceLevel = "CERTAIN" | "PROBABLE" | "UNKNOWN";

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
};

function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 90) return "CERTAIN";
  if (confidence >= 50) return "PROBABLE";
  return "UNKNOWN";
}

function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

function analyzeCategorie(categorie: string | null): ToyAnalysis["suggestions"] {
  if (!categorie) return [];
  const key = normalizeKey(categorie);
  const match = LEGACY_CATEGORY_MAP[key];
  if (!match) return [];
  return [{
    entityType: match.entityType,
    id: match.id,
    name: match.name,
    confidence: match.confidence,
    level: getConfidenceLevel(match.confidence),
    source: `categorie="${categorie}"`,
  }];
}

function analyzeStudio(studio: string): ToyAnalysis["suggestions"] {
  if (!studio) return [];
  const suggestions: ToyAnalysis["suggestions"] = [];

  const directKey = normalizeKey(studio);
  if (LEGACY_STUDIO_MAP[directKey]) {
    for (const m of LEGACY_STUDIO_MAP[directKey]) {
      suggestions.push({
        entityType: m.entityType,
        id: m.id,
        name: m.name,
        confidence: m.confidence,
        level: getConfidenceLevel(m.confidence),
        source: `studio="${studio}" (correspondance directe)`,
      });
    }
    return suggestions;
  }

  const parts = studio.split(/[/,]/).map((p) => normalizeKey(p.trim())).filter(Boolean);
  for (const part of parts) {
    if (LEGACY_STUDIO_MAP[part]) {
      for (const m of LEGACY_STUDIO_MAP[part]) {
        const alreadyFound = suggestions.find((s) => s.id === m.id);
        if (!alreadyFound) {
          suggestions.push({
            entityType: m.entityType,
            id: m.id,
            name: m.name,
            confidence: Math.max(50, m.confidence - 10),
            level: getConfidenceLevel(Math.max(50, m.confidence - 10)),
            source: `studio="${studio}" (partie "${part}")`,
          });
        }
      }
    }
  }

  return suggestions;
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [
      { data: toys, error },
      { data: categories },
      { data: studios },
      { data: licenses },
      { data: franchises },
      { data: characters },
      { data: locations },
    ] = await Promise.all([
      supabase.from("toys").select(`
        id, nom, theme_id, categorie, studio, category_ids, studio_ids, license_ids, franchise_ids, character_ids, location_ids, user_id,
        themes ( name )
      `).eq("user_id", user.id),
      supabase.from("categories_v2").select("id, name, aliases, active").eq("active", true),
      supabase.from("studios").select("id, name, aliases, active").eq("active", true),
      supabase.from("licenses").select("id, name, aliases, active").eq("active", true),
      supabase.from("franchises").select("id, name, aliases, active").eq("active", true),
      supabase.from("characters").select("id, name, aliases, active").eq("active", true),
      supabase.from("locations").select("id, name, aliases, active").eq("active", true),
    ]);

    if (error) throw error;

    const results: ToyAnalysis[] = [];
    let alreadyMigrated = 0;

    for (const toy of (toys ?? [])) {
      const validCategoryIds = toy.category_ids?.filter(Boolean) || [];
      const isMigrated = validCategoryIds.length > 0;

      if (isMigrated) {
        alreadyMigrated++;
      }

      const nomStr = (toy.nom || "").trim();
      const catStr = (toy.categorie || "").trim();
      const studioStr = (toy.studio || "").trim();
      const themeStr = ((toy.themes as any)?.name || "").trim();
      
      const fullSearchStr = ` ${nomStr} ${themeStr} ${catStr} ${studioStr} `.toLowerCase();

      let suggestions: ToyAnalysis["suggestions"] = [];

      const addSuggestion = (entityType: string, name: string, confidence: number, source: string, overrideId?: string) => {
        if (!name) return;
        const id = overrideId || `new:${name}`;
        if (!suggestions.some(s => s.id === id || s.name.toLowerCase() === name.toLowerCase())) {
          suggestions.push({
            entityType,
            id,
            name,
            confidence,
            level: confidence >= 90 ? "CERTAIN" : "PROBABLE",
            source
          });
        }
      };

      let categoryFound = false;
      if (fullSearchStr.includes("puzzle")) { addSuggestion("category", "Puzzle", 100, "Déduit du mot clé", "cat_puzzle"); categoryFound = true; }
      else if (fullSearchStr.includes("figurine") || fullSearchStr.includes("funko") || fullSearchStr.includes("amiibo")) { addSuggestion("category", "Figurine", 100, "Déduit du mot clé", "cat_figurine"); categoryFound = true; }
      else if (fullSearchStr.includes("lego") || fullSearchStr.includes("playmobil") || fullSearchStr.includes("meccano") || fullSearchStr.includes("construction")) { addSuggestion("category", "Construction", 100, "Déduit du mot clé", "cat_construction"); categoryFound = true; }
      else if (fullSearchStr.includes("voiture") || fullSearchStr.includes("véhicule") || fullSearchStr.includes("hot wheels")) { addSuggestion("category", "Véhicule", 100, "Déduit du mot clé", "cat_vehicule"); categoryFound = true; }
      else if (fullSearchStr.includes("peluche") || fullSearchStr.includes("doudou")) { addSuggestion("category", "Peluche", 100, "Déduit du mot clé", "cat_peluche"); categoryFound = true; }
      else if (fullSearchStr.includes("jeu") || fullSearchStr.includes("plateau")) { addSuggestion("category", "Jeu", 100, "Déduit du mot clé", "cat_jeu"); categoryFound = true; }
      
      if (!categoryFound && themeStr) {
        addSuggestion("category", themeStr, 80, "Repris du champ Thème (V1)");
      }

      const knownFranchises = ["star wars", "marvel", "disney", "pixar", "harry potter", "batman", "dc comics", "jurassic park"];
      const knownLicenses = ["disney", "marvel", "dc comics"];
      
      if (studioStr) {
        const studioLower = studioStr.toLowerCase();
        if (knownFranchises.includes(studioLower)) {
          addSuggestion("franchise", studioStr, 90, "Repris du champ Studio (V1)");
        } else {
          addSuggestion("studio", studioStr, 100, "Repris du champ Studio (V1)");
        }
      } else {
        if (fullSearchStr.includes("lego")) addSuggestion("studio", "Lego", 90, "Déduit du mot clé");
        else if (fullSearchStr.includes("funko")) addSuggestion("studio", "Funko", 90, "Déduit du mot clé");
        else if (fullSearchStr.includes("ravensburger")) addSuggestion("studio", "Ravensburger", 90, "Déduit du mot clé");
        else if (fullSearchStr.includes("nathan")) addSuggestion("studio", "Nathan", 90, "Déduit du mot clé");
        else if (fullSearchStr.includes("clementoni")) addSuggestion("studio", "Clementoni", 90, "Déduit du mot clé");
        else if (fullSearchStr.includes("educa")) addSuggestion("studio", "Educa", 90, "Déduit du mot clé");
      }

      if (catStr) {
        const catLower = catStr.toLowerCase();
        const isNormalCategory = ["puzzle", "figurine", "voiture", "monument", "ville"].some(w => catLower.includes(w));
        
        if (!isNormalCategory) {
          if (knownLicenses.includes(catLower)) {
            addSuggestion("license", catStr, 90, "Repris du champ Catégorie (V1)");
          } else {
            addSuggestion("franchise", catStr, 90, "Repris du champ Catégorie (V1)");
          }
        }
      }

      const nomLower = nomStr.toLowerCase();
      if (nomLower.includes("chewbacca")) addSuggestion("character", "Chewbacca", 90, "Déduit du nom");
      if (nomLower.includes("darth vader") || nomLower.includes("dark vador")) addSuggestion("character", "Darth Vader", 90, "Déduit du nom");
      if (nomLower.includes("luke skywalker")) addSuggestion("character", "Luke Skywalker", 90, "Déduit du nom");
      if (nomLower.includes("yoda")) addSuggestion("character", "Yoda", 90, "Déduit du nom");
      if (nomLower.includes("c3-po") || nomLower.includes("c-3po")) addSuggestion("character", "C-3PO", 90, "Déduit du nom");
      if (nomLower.includes("r2-d2")) addSuggestion("character", "R2-D2", 90, "Déduit du nom");
      if (nomLower.includes("mickey")) addSuggestion("character", "Mickey Mouse", 90, "Déduit du nom");
      if (nomLower.includes("simba")) addSuggestion("character", "Simba", 90, "Déduit du nom");
      if (nomLower.includes("spider-man") || nomLower.includes("spiderman")) addSuggestion("character", "Spider-Man", 90, "Déduit du nom");
      if (nomLower.includes("iron man")) addSuggestion("character", "Iron Man", 90, "Déduit du nom");
      if (nomLower.includes("batman")) addSuggestion("character", "Batman", 90, "Déduit du nom");
      if (nomLower.includes("superman")) addSuggestion("character", "Superman", 90, "Déduit du nom");
      
      if (suggestions.some(s => s.name.toLowerCase().includes("star wars") || s.name.toLowerCase().includes("marvel"))) {
        addSuggestion("license", "Disney", 80, "Déduit de la franchise");
      }
      if (suggestions.some(s => s.name.toLowerCase().includes("batman") || s.name.toLowerCase().includes("superman"))) {
        addSuggestion("license", "DC Comics", 80, "Déduit de la franchise");
      }

      const hasCertain  = suggestions.some((s) => s.level === "CERTAIN");
      const hasProbable = suggestions.some((s) => s.level === "PROBABLE");
      const allCertain  = suggestions.length > 0 && suggestions.every((s) => s.level === "CERTAIN");

      let status: ToyAnalysis["status"];
      if (isMigrated)        status = "migrated";
      else if (allCertain)   status = "auto-migrable";
      else if (hasProbable || hasCertain) status = "needs-review";
      else                   status = "unresolved";

      const resolveEntities = (ids: string[] | null, entities: any[] | null) => {
        if (!ids || !entities) return [];
        return ids.map(id => {
          const e = entities.find(e => e.id === id);
          return e ? { id: e.id, name: e.name, slug: "" } : null;
        }).filter(Boolean) as { id: string; name: string; slug: string }[];
      };

      results.push({
        toyId: toy.id,
        nom: toy.nom,
        themeId: toy.theme_id,
        legacy: { categorie: toy.categorie, studio: toy.studio },
        suggestions,
        status,
        v2_data: isMigrated ? {
          category_ids: resolveEntities(toy.category_ids, categories),
          studio_ids: resolveEntities(toy.studio_ids, studios),
          license_ids: resolveEntities(toy.license_ids, licenses),
          franchise_ids: resolveEntities(toy.franchise_ids, franchises),
          character_ids: resolveEntities(toy.character_ids, characters),
          location_ids: resolveEntities(toy.location_ids, locations),
        } : undefined
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
  } catch (err: any) {
    console.error("[Migration Report API] Error:", err);
    return NextResponse.json({ error: "Erreur interne", details: err.message }, { status: 500 });
  }
}

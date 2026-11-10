/**
 * lib/themeProfile.ts
 *
 * Système de profils de thème pour ToyForm.
 * Chaque profil définit quels champs afficher, dans quel ordre et avec quels labels,
 * selon le type de thème détecté par mots-clés dans le nom du thème.
 */

// =============================================================================
// Types
// =============================================================================

import type { CustomFieldDefinition } from "@/app/actions/themeProfiles";

/** Clés de tous les champs gérés par le système de profil */
export type FieldKey =
  | "numero"      // Numéro / référence / code de set
  | "nb_pieces"   // Nombre de pièces
  | "subcategory" // Sous-catégorie
  | "franchise"   // Franchise / univers
  | "characters"  // Personnage(s)
  | "studio"      // Studio / fabricant / éditeur
  | "license"     // Licence (ex: Disney, Marvel)
  | "taille"      // Taille / dimensions
  | "location";   // Lieu d'achat / provenance

/** Profil de priorité des champs pour un type de thème */
export type ThemeProfile = {
  /** Identifiant interne du profil */
  id: string;
  /** Emoji + label affiché à l'utilisateur */
  label: string;
  emoji: string;

  /**
   * Champs hissés dans la SECTION PRINCIPALE (toujours visible, avant "Plus de détails").
   * Ces champs sont les plus importants pour ce type de thème.
   */
  primaryFields: FieldKey[];

  /**
   * Champs affichés EN TÊTE de la section "Plus de détails",
   * car pertinents mais secondaires.
   */
  detailsFirstFields: FieldKey[];

  /**
   * Champs complètement MASQUÉS, même dans la section détails.
   * Utilisé pour les champs non pertinents pour ce type de thème
   * (ex: nb_pieces pour une figurine — elle n'a qu'une seule pièce).
   */
  hiddenFields: FieldKey[];

  /**
   * Si true, la section "Plus de détails" s'ouvre automatiquement à l'init.
   * À utiliser quand les champs clés sont dans detailsFirstFields.
   */
  autoOpenDetails: boolean;

  /**
   * Labels contextuels pour les champs (surcharge des labels par défaut).
   * Permet d'adapter la terminologie au thème (ex: "Numéro de set" vs "Numéro #").
   */
  fieldLabels?: Partial<Record<FieldKey, string>>;

  /**
   * Placeholders contextuels pour les champs SmartSelect.
   */
  fieldPlaceholders?: Partial<Record<FieldKey, string>>;

  /**
   * Noms de catégories suggérées à proposer quand aucune catégorie n'est sélectionnée.
   * Correspond aux noms réels dans categories_v2 (pas des IDs).
   */
  suggestedCategoryNames?: string[];

  /**
   * Texte d'aide affiché sous le nom du thème détecté,
   * pour guider l'utilisateur sur quoi remplir en priorité.
   */
  hint?: string;

  /**
   * Studio écrit automatiquement en base quand le champ est masqué
   * (thème fabricant : Funko, LEGO, Playmobil).
   */
  forcedStudioName?: string;

  /**
   * Noms essayés dans le référentiel, du préféré au synonyme.
   * Le premier est créé s'il n'existe pas encore.
   */
  forcedStudioCandidates?: string[];

  /**
   * Thèmes / gammes proposés sous le champ sous-catégorie (ex. thèmes LEGO).
   */
  suggestedSubcategoryNames?: string[];

  /**
   * Définition des champs personnalisés dynamiques (ex: État de la boîte)
   */
  custom_fields_definition?: CustomFieldDefinition[];
};

/**
 * Thèmes où l'année se dédouble :
 * - année de sortie (produit)
 * - année de Noël / anniversaire / calendrier de l'Avent (occasion)
 * Les autres thèmes gardent un seul champ « Année ».
 */
const OCCASION_YEAR_PROFILE_IDS = new Set([
  "lego",
  "meccano",
  "playmobil",
  "figurine",
  "pop",
  "puzzle",
  "puzzle3d",
  "peluche",
  "vehicule",
]);

export type GiftOccasion = "noel" | "anniversaire" | "avent";

export const GIFT_OCCASIONS: { id: GiftOccasion; label: string }[] = [
  { id: "noel", label: "Noël" },
  { id: "anniversaire", label: "Anniversaire" },
  { id: "avent", label: "Calendrier de l'Avent" },
];

export function giftOccasionLabel(occasion: string | null | undefined): string | null {
  return GIFT_OCCASIONS.find((o) => o.id === occasion)?.label ?? null;
}

export function isGiftOccasion(value: string | null | undefined): value is GiftOccasion {
  return GIFT_OCCASIONS.some((item) => item.id === value);
}

export function themeHasOccasionYear(themeName: string): boolean {
  return OCCASION_YEAR_PROFILE_IDS.has(getThemeProfile(themeName || "").id);
}

export function releaseYearLabel(themeName: string): string {
  return themeHasOccasionYear(themeName) ? "Année de sortie" : "Année";
}

/**
 * Année de sortie affichable.
 * En base c'est une année (2024), pas un timestamp : `new Date(2024)` donnerait 1970.
 */
export function formatReleaseYear(
  value: string | number | null | undefined
): string | null {
  if (value == null || value === "") return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (value >= 1900 && value <= 2100) return String(Math.trunc(value));
    const fromTimestamp = new Date(value).getFullYear();
    return fromTimestamp >= 1900 && fromTimestamp <= 2100
      ? String(fromTimestamp)
      : null;
  }

  const text = String(value).trim();
  if (/^\d{4}$/.test(text)) return text;
  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) return null;
  const year = new Date(parsed).getFullYear();
  return year >= 1900 && year <= 2100 ? String(year) : null;
}

// =============================================================================
// Profils — un par type de thème
// @deprecated Ces profils statiques sont conservés comme fallback legacy.
// La source de vérité est désormais la table `theme_profiles` en base.
// À supprimer quand ToyForm et ThemeForm n'en auront plus besoin.
// =============================================================================
const PROFILES: Record<string, ThemeProfile> = {

  // ── LEGO ────────────────────────────────────────────────────────────────────
  // Fabricant imposé (The LEGO Group). Le thème LEGO (Marvel, Icons, Star Wars…)
  // est la sous-catégorie ; la franchise reste un champ distinct.
  lego: {
    id: "lego",
    label: "Lego",
    emoji: "🟡",
    primaryFields: ["numero", "nb_pieces", "subcategory", "franchise"],
    detailsFirstFields: ["license", "location"],
    hiddenFields: ["studio", "taille", "characters"],
    autoOpenDetails: false,
    forcedStudioName: "The LEGO Group",
    forcedStudioCandidates: ["The LEGO Group", "LEGO", "Lego"],
    fieldLabels: {
      numero: "Numéro de set",
      nb_pieces: "Nombre de pièces",
      subcategory: "Thème LEGO",
      franchise: "Franchise",
      license: "Licence",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Star Wars, Marvel, Icons, City, Technic…",
      franchise: "Univers : Star Wars, Marvel, Harry Potter, DC…",
      license: "Disney, Lucasfilm, Warner…",
    },
    suggestedCategoryNames: ["Lego", "Construction"],
    suggestedSubcategoryNames: [
      "Star Wars",
      "Marvel",
      "Icons",
      "City",
      "Technic",
      "Harry Potter",
      "Ninjago",
      "Creator",
      "Disney",
      "DC",
      "Speed Champions",
      "Architecture",
      "Câdeaux",
      "Creator 3in1",
      "Brick Headz",
      "Creator Expert",
      "Indiana Jones",
      "Jurassic World",
      "Super Mario"
    ],
    hint: "Le fabricant est enregistré automatiquement (The LEGO Group). Indiquez le thème LEGO et, si besoin, la franchise.",
  },

  // ── PUZZLE ──────────────────────────────────────────────────────────────────
  puzzle: {
    id: "puzzle",
    label: "Puzzle",
    emoji: "🔵",
    primaryFields: ["nb_pieces", "studio"],
    detailsFirstFields: ["license", "location"],
    hiddenFields: ["numero", "characters", "franchise", "taille"],
    autoOpenDetails: false,
    fieldLabels: {
      nb_pieces: "Nombre de pièces",
      studio: "Éditeur / Fabricant",
      license: "Licence / Visuel",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      studio: "Ravensburger, Nathan, Clementoni…",
      license: "Disney, Star Wars, Paysage…",
    },
    suggestedCategoryNames: ["Puzzle"],
    hint: "Essentiels : nombre de pièces et éditeur.",
  },

  // ── FUNKO POP ───────────────────────────────────────────────────────────────
  pop: {
    id: "pop",
    label: "Funko Pop",
    emoji: "🟠",
    primaryFields: ["numero", "characters", "franchise", "subcategory"],
    detailsFirstFields: ["license", "location"],
    hiddenFields: ["nb_pieces", "taille", "studio"],
    autoOpenDetails: false,
    forcedStudioName: "Funko",
    forcedStudioCandidates: ["Funko", "Funko Pop"],
    fieldLabels: {
      numero: "Numéro Funko (#)",
      franchise: "Univers / Série",
      characters: "Personnage représenté",
      subcategory: "Sous-catégorie",
      license: "Licence",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      franchise: "Marvel, Star Wars, Disney…",
      characters: "Iron Man, Baby Yoda, Elsa…",
      subcategory: "Herbivore, Carnivore, Transformers…",
      license: "Avengers, Mandalorian, Frozen…",
    },
    suggestedCategoryNames: ["Funko Pop", "Figurine à collectionner"],
    hint: "Essentiels : numéro #, personnage et univers. Le fabricant Funko est enregistré automatiquement.",
  },

  // ── FIGURINE ────────────────────────────────────────────────────────────────
  figurine: {
    id: "figurine",
    label: "Figurine",
    emoji: "🔴",
    primaryFields: ["franchise", "characters", "subcategory"],
    detailsFirstFields: ["studio", "license", "location"],
    hiddenFields: ["numero", "nb_pieces", "taille"],
    autoOpenDetails: false,
    fieldLabels: {
      subcategory: "Type de figurine",
      franchise: "Univers / Franchise",
      characters: "Personnage(s)",
      studio: "Fabricant",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Articulée, Statique, Mini-figurine…",
      franchise: "Marvel, Star Wars, Toy Story…",
      studio: "Hasbro, Bandai, NECA…",
    },
    suggestedCategoryNames: ["Figurine", "Figurine articulée", "Figurine statique"],
    hint: "Essentiels : franchise, personnage(s) et type.",
  },

  // ── PELUCHE ─────────────────────────────────────────────────────────────────
  peluche: {
    id: "peluche",
    label: "Peluche",
    emoji: "🟣",
    primaryFields: ["characters", "franchise"],
    detailsFirstFields: ["license", "location"],
    hiddenFields: ["numero", "nb_pieces", "subcategory", "studio", "taille"],
    autoOpenDetails: false,
    fieldLabels: {
      characters: "Personnage représenté",
      franchise: "Univers / Franchise",
      license: "Licence",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      characters: "Simba, Winnie, Stitch…",
      franchise: "Disney, Pixar, Studio Ghibli…",
    },
    suggestedCategoryNames: ["Peluche", "Doudou"],
    hint: "Essentiels : personnage et franchise.",
  },

  // ── PLAYMOBIL ───────────────────────────────────────────────────────────────
  playmobil: {
    id: "playmobil",
    label: "Playmobil",
    emoji: "🟢",
    primaryFields: ["numero", "nb_pieces", "subcategory"],
    detailsFirstFields: ["franchise", "location"],
    hiddenFields: ["characters", "studio", "license"],
    autoOpenDetails: false,
    forcedStudioName: "Playmobil",
    forcedStudioCandidates: ["Playmobil", "Playmobil GmbH"],
    fieldLabels: {
      numero: "Numéro de set",
      nb_pieces: "Nombre de pièces",
      subcategory: "Thème Playmobil",
      franchise: "Collection / Série",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "City, Novelmore, 1.2.3…",
      franchise: "Ghostbusters, Astérix…",
    },
    suggestedCategoryNames: ["Playmobil", "Construction"],
    hint: "Essentiels : numéro de set, pièces et thème.",
  },

  // ── MECCANO / CONSTRUCTION ──────────────────────────────────────────────────
  meccano: {
    id: "meccano",
    label: "Jeux de construction",
    emoji: "⚙️",
    primaryFields: ["subcategory", "studio", "numero"],
    detailsFirstFields: ["nb_pieces", "franchise", "location"],
    hiddenFields: ["taille", "characters", "license"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro de modèle",
      nb_pieces: "Nombre de pièces",
      subcategory: "Type de construction",
      studio: "Fabricant / Marque",
      franchise: "Gamme / Série",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Véhicule radiocommandé, Robot, Set…",
      studio: "Meccano, Engineering & Robotics…",
    },
    suggestedCategoryNames: ["Construction", "Jeux de construction", "Maquette"],
    hint: "Essentiels : type, fabricant et numéro de modèle.",
  },

  // ── PUZZLE 3D ───────────────────────────────────────────────────────────────
  puzzle3d: {
    id: "puzzle3d",
    label: "Puzzle 3D",
    emoji: "🧊",
    primaryFields: ["numero", "nb_pieces", "studio"],
    detailsFirstFields: ["license", "location"],
    hiddenFields: ["characters", "franchise", "taille"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro / Référence",
      nb_pieces: "Nombre de pièces",
      studio: "Éditeur / Fabricant",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      studio: "Ravensburger, Wrebbit 3D…",
      license: "Harry Potter, Game of Thrones…",
    },
    suggestedCategoryNames: ["Puzzle 3D", "Maquette"],
    hint: "Essentiels : référence, pièces et éditeur.",
  },

  // ── VÉHICULE ────────────────────────────────────────────────────────────────
  vehicule: {
    id: "vehicule",
    label: "Véhicule / Modèle réduit",
    emoji: "🚗",
    primaryFields: ["numero", "studio", "subcategory"],
    detailsFirstFields: ["franchise", "taille", "location"],
    hiddenFields: ["nb_pieces", "characters", "license"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro de série / Référence",
      subcategory: "Type de véhicule",
      studio: "Fabricant / Marque",
      franchise: "Collection / Série",
      taille: "Échelle (ex: 1/43)",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Voiture, Camion, Moto, Avion…",
      studio: "Hot Wheels, Majorette, Matchbox…",
      franchise: "Speed Champions, Fast & Furious…",
    },
    suggestedCategoryNames: ["Véhicule", "Modèle réduit", "Voiture"],
    hint: "Essentiels : référence, marque et type de véhicule.",
  },

  // ── SOUVENIR ────────────────────────────────────────────────────────────────
  souvenir: {
    id: "souvenir",
    label: "Souvenir / Voyage",
    emoji: "🏖️",
    primaryFields: ["subcategory", "location"],
    detailsFirstFields: [],
    hiddenFields: ["numero", "nb_pieces", "studio", "license", "franchise", "characters", "taille"],
    autoOpenDetails: false,
    fieldLabels: {
      location: "Lieu d'achat / provenance",
      subcategory: "Type de souvenir",
    },
    fieldPlaceholders: {
      location: "Bretagne, Disneyland Paris, Tokyo…",
      subcategory: "Phare, Magnet, Carte postale…",
    },
    suggestedCategoryNames: ["Souvenir", "Phare", "Décoration"],
    hint: "Essentiels : type de souvenir et lieu.",
  },

  // ── DÉFAUT ──────────────────────────────────────────────────────────────────
  default: {
    id: "default",
    label: "Par défaut",
    emoji: "⚪",
    primaryFields: ["subcategory", "studio", "franchise"],
    detailsFirstFields: ["numero", "nb_pieces", "characters", "license", "taille", "location"],
    hiddenFields: [],
    autoOpenDetails: false,
    hint: "Renseignez d’abord la sous-catégorie, le studio et la franchise.",
  },
};

/** Liste de tous les profils disponibles pour affichage dans l'interface */
export const ALL_PROFILES = Object.values(PROFILES);

// =============================================================================
// Règles de détection (mots-clés → profil)
// L'ordre est important : du plus spécifique au moins spécifique.
// =============================================================================

type DetectionRule = {
  keywords: string[];
  profileId: string;
};

const DETECTION_RULES: DetectionRule[] = [
  // Marques spécifiques d'abord
  { keywords: ["lego", "legos", "légo", "légos"], profileId: "lego" },
  { keywords: ["playmobil", "playmobiles", "playmobils"], profileId: "playmobil" },
  { keywords: ["meccano", "mecano", "construction", "knex", "k'nex", "mega bloks"], profileId: "meccano" },
  { keywords: ["funko", "funko pop"], profileId: "pop" },

  // Types de jouets
  { keywords: ["puzzle 3d", "puzzles 3d", "3d puzzle", "puzzle-3d"], profileId: "puzzle3d" },
  { keywords: ["puzzle", "puzzles", "jigsaw"], profileId: "puzzle" },
  { keywords: ["peluche", "peluches", "plush", "doudou"], profileId: "peluche" },
  {
    keywords: ["figurine", "figurines", "figure", "figures",
      "action figure", "statuette", "statuettes"], profileId: "figurine"
  },

  // Véhicules / modèles réduits
  {
    keywords: ["voiture", "voitures", "vehicule", "vehicules",
      "hot wheels", "matchbox", "majorette",
      "modele reduit", "diecast"], profileId: "vehicule"
  },

  // Souvenirs
  {
    keywords: ["souvenir", "souvenirs", "voyage", "voyages",
      "cadeau", "phare"], profileId: "souvenir"
  },

  // "pop" seul en dernier (moins spécifique, évite les faux positifs)
  { keywords: ["pop"], profileId: "pop" },
];

// =============================================================================
// Fonctions publiques
// =============================================================================

/**
 * Retourne le profil de thème pour un nom de thème donné.
 * Détection par mots-clés entiers (word boundary), insensible à la casse et aux accents.
 */
export function getThemeProfile(themeName: string): ThemeProfile {
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const normName = norm(themeName);

  for (const rule of DETECTION_RULES) {
    for (const keyword of rule.keywords) {
      const normKw = norm(keyword);
      const regex = new RegExp(`\\b${normKw}\\b`, "i");
      if (regex.test(normName)) {
        return PROFILES[rule.profileId];
      }
    }
  }

  return PROFILES.default;
}

const MANUFACTURER_PROFILE_IDS = new Set(["lego", "pop", "playmobil"]);

function normalizeProfileLabel(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

/** Retrouve un profil intégré à partir de son id legacy ou de son libellé (profil en base). */
function builtinProfileId(profile: ThemeProfile): string | null {
  if (PROFILES[profile.id]) return profile.id;
  const label = normalizeProfileLabel(profile.label);
  if (label === "funko") return "pop";
  const match = Object.values(PROFILES).find((candidate) => normalizeProfileLabel(candidate.label) === label);
  return match?.id ?? null;
}

/**
 * Thème fabricant (Funko, LEGO, Playmobil) : masque le studio et impose sa valeur.
 * Pour LEGO, aligne aussi la liste des champs (thème LEGO + franchise).
 * S'applique aux profils codés en dur et à ceux chargés depuis la base.
 */
export function applyManufacturerProfile(profile: ThemeProfile, themeName: string): ThemeProfile {
  const fromProfile = builtinProfileId(profile);
  const fromTheme = getThemeProfile(themeName || "").id;
  const kind = fromProfile && fromProfile !== "default" ? fromProfile : fromTheme;
  if (!MANUFACTURER_PROFILE_IDS.has(kind)) return profile;

  const builtin = PROFILES[kind];
  const withoutStudio = (fields: FieldKey[]) => fields.filter((field) => field !== "studio");

  if (kind === "lego") {
    return {
      ...profile,
      primaryFields: builtin.primaryFields,
      detailsFirstFields: builtin.detailsFirstFields,
      hiddenFields: builtin.hiddenFields,
      fieldLabels: { ...profile.fieldLabels, ...builtin.fieldLabels },
      fieldPlaceholders: { ...profile.fieldPlaceholders, ...builtin.fieldPlaceholders },
      hint: builtin.hint,
      forcedStudioName: builtin.forcedStudioName,
      forcedStudioCandidates: builtin.forcedStudioCandidates,
      suggestedSubcategoryNames: builtin.suggestedSubcategoryNames,
    };
  }

  const hiddenFields = profile.hiddenFields.filter((field) => field !== "studio");
  const detailsFirstFields = withoutStudio(profile.detailsFirstFields);
  if (kind === "pop") {
    const withoutSubcategoryHidden = hiddenFields.filter((field) => field !== "subcategory");
    const primaryFields = withoutStudio(profile.primaryFields);
    if (!primaryFields.includes("subcategory")) primaryFields.push("subcategory");
    return {
      ...profile,
      primaryFields,
      detailsFirstFields,
      hiddenFields: Array.from(new Set<FieldKey>([...withoutSubcategoryHidden, "studio"])),
      fieldLabels: {
        ...profile.fieldLabels,
        subcategory: profile.fieldLabels?.subcategory || builtin.fieldLabels?.subcategory || "Sous-catégorie",
      },
      fieldPlaceholders: {
        ...profile.fieldPlaceholders,
        subcategory: profile.fieldPlaceholders?.subcategory || builtin.fieldPlaceholders?.subcategory,
      },
      forcedStudioName: builtin.forcedStudioName,
      forcedStudioCandidates: builtin.forcedStudioCandidates,
    };
  }

  return {
    ...profile,
    primaryFields: withoutStudio(profile.primaryFields),
    detailsFirstFields,
    hiddenFields: Array.from(new Set<FieldKey>([...hiddenFields, "studio"])),
    forcedStudioName: builtin.forcedStudioName,
    forcedStudioCandidates: builtin.forcedStudioCandidates,
  };
}

/**
 * Profil effectif d'un jouet à partir du nom de thème et, s'il existe,
 * du libellé du profil enregistré en base.
 */
export function resolveManufacturerProfile(
  themeName: string,
  profileLabel?: string | null
): ThemeProfile {
  const fromLabel = profileLabel ? getThemeProfile(profileLabel) : null;
  const base = fromLabel && fromLabel.id !== "default"
    ? { ...fromLabel, label: profileLabel || fromLabel.label }
    : getThemeProfile(themeName || profileLabel || "");
  return applyManufacturerProfile(base, themeName || profileLabel || "");
}

function foldName(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

/** Premier candidat dont le nom ou un alias correspond exactement. */
export function pickByCandidateNames<T extends { name: string; aliases?: string[] | null }>(
  entities: T[],
  candidates: string[]
): T | null {
  for (const candidate of candidates) {
    const query = foldName(candidate);
    if (!query) continue;
    const hit = entities.find(
      (entity) => foldName(entity.name) === query
        || (entity.aliases ?? []).some((alias) => foldName(alias) === query)
    );
    if (hit) return hit;
  }
  return null;
}

/**
 * Retourne le label contextuel d'un champ pour un profil donné,
 * ou null si pas de label personnalisé (→ utiliser le label par défaut).
 */
export function getFieldLabel(profile: ThemeProfile, field: FieldKey): string | null {
  return profile.fieldLabels?.[field] ?? null;
}

/**
 * Retourne le placeholder contextuel d'un champ pour un profil donné,
 * ou null si pas de placeholder personnalisé.
 */
export function getFieldPlaceholder(profile: ThemeProfile, field: FieldKey): string | null {
  return profile.fieldPlaceholders?.[field] ?? null;
}

/**
 * Retourne true si un champ est caché dans ce profil.
 */
export function isFieldHidden(profile: ThemeProfile, field: FieldKey): boolean {
  return profile.hiddenFields.includes(field);
}

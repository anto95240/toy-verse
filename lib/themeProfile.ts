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
   * Définition des champs personnalisés dynamiques (ex: État de la boîte)
   */
  custom_fields_definition?: CustomFieldDefinition[];
};

// =============================================================================
// Profils — un par type de thème
// @deprecated Ces profils statiques sont conservés comme fallback legacy.
// La source de vérité est désormais la table `theme_profiles` en base.
// À supprimer quand ToyForm et ThemeForm n'en auront plus besoin.
// =============================================================================
const PROFILES: Record<string, ThemeProfile> = {

  // ── LEGO ────────────────────────────────────────────────────────────────────
  // Essentiels : n° set, pièces, gamme, série/thème. Secondaire : fabricant, lieu.
  lego: {
    id: "lego",
    label: "Lego",
    emoji: "🟡",
    primaryFields: ["numero", "nb_pieces", "subcategory", "franchise"],
    detailsFirstFields: ["studio", "location"],
    hiddenFields: ["taille", "characters"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro de set",
      nb_pieces: "Nombre de pièces",
      subcategory: "Gamme",
      franchise: "Série / Thème",
      studio: "Fabricant",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Technic, Icons, City, Creator…",
      franchise: "Star Wars, Harry Potter, Ninjago…",
      studio: "The LEGO Group…",
    },
    suggestedCategoryNames: ["Lego", "Construction"],
    hint: "Essentiels : numéro de set, pièces, gamme et série/thème.",
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
    primaryFields: ["numero", "characters", "franchise"],
    detailsFirstFields: ["license", "location"],
    hiddenFields: ["nb_pieces", "taille", "subcategory", "studio"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro Funko (#)",
      franchise: "Univers / Série",
      characters: "Personnage représenté",
      license: "Licence",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      franchise: "Marvel, Star Wars, Disney…",
      characters: "Iron Man, Baby Yoda, Elsa…",
      license: "Avengers, Mandalorian, Frozen…",
    },
    suggestedCategoryNames: ["Funko Pop", "Figurine à collectionner"],
    hint: "Essentiels : numéro #, personnage et univers.",
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

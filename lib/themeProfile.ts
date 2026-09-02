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
// =============================================================================

const PROFILES: Record<string, ThemeProfile> = {

  // ── 🟡 LEGO ─────────────────────────────────────────────────────────────────
  // Champs clés : numéro de set + pièces. La gamme (Technic, Icons...) et le
  // thème (Star Wars, Harry Potter...) viennent après.
  lego: {
    id: "lego",
    label: "Lego",
    emoji: "🟡",
    primaryFields: ["numero", "nb_pieces"],
    detailsFirstFields: ["subcategory", "franchise"],
    hiddenFields: ["taille", "characters"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro de set",
      nb_pieces: "Nombre de pièces",
      subcategory: "Gamme",
      franchise: "Thème Lego",
      studio: "Série",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Technic, Icons, City, Creator…",
      franchise: "Star Wars, Harry Potter, Ninjago…",
    },
    suggestedCategoryNames: ["Lego", "Construction"],
    hint: "Commencez par le numéro de set et le nombre de pièces.",
  },

  // ── 🔵 PUZZLE ───────────────────────────────────────────────────────────────
  // Champ clé : nombre de pièces (l'identifiant principal d'un puzzle).
  // L'éditeur (studio) et la licence sont secondaires.
  puzzle: {
    id: "puzzle",
    label: "Puzzle",
    emoji: "🔵",
    primaryFields: ["nb_pieces"],
    detailsFirstFields: ["studio", "license"],
    hiddenFields: ["numero", "characters", "franchise", "taille"],
    autoOpenDetails: false,
    fieldLabels: {
      nb_pieces: "Nombre de pièces",
      studio: "Éditeur / Fabricant",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      studio: "Ravensburger, Nathan, Clementoni…",
      license: "Disney, Star Wars, Paysage…",
    },
    suggestedCategoryNames: ["Puzzle"],
    hint: "Le nombre de pièces est l'info principale d'un puzzle.",
  },

  // ── 🟠 FUNKO POP / POP ──────────────────────────────────────────────────────
  // Champ clé : numéro # dans la collection Funko.
  // Franchise + personnage permettent d'identifier exactement la pop.
  // On cache nb_pieces (toujours 1) et taille (standard).
  pop: {
    id: "pop",
    label: "Funko Pop",
    emoji: "🟠",
    primaryFields: ["numero"],
    detailsFirstFields: ["franchise", "characters", "license"],
    hiddenFields: ["nb_pieces", "taille", "subcategory", "studio"],
    autoOpenDetails: true,
    fieldLabels: {
      numero: "Numéro Funko (#)",
      franchise: "Univers",
      characters: "Personnage représenté",
      license: "Licence / Série",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      franchise: "Marvel, Star Wars, Disney…",
      characters: "Iron Man, Baby Yoda, Elsa…",
      license: "Avengers, Mandalorian, Frozen…",
    },
    suggestedCategoryNames: ["Funko Pop", "Figurine à collectionner"],
    hint: "Indiquez le numéro # et le personnage représenté.",
  },

  // ── 🔴 FIGURINE ─────────────────────────────────────────────────────────────
  // Pas de numéro ni de nombre de pièces — la franchise et le personnage
  // sont les infos les plus utiles. La sous-catégorie précise le type.
  figurine: {
    id: "figurine",
    label: "Figurine",
    emoji: "🔴",
    primaryFields: [],
    detailsFirstFields: ["franchise", "characters", "subcategory", "studio", "license"],
    hiddenFields: ["numero", "nb_pieces", "taille"],
    autoOpenDetails: true,
    fieldLabels: {
      subcategory: "Type de figurine",
      franchise: "Univers / Franchise",
      studio: "Fabricant",
      location: "Lieu d'achat",
    },
    fieldPlaceholders: {
      subcategory: "Articulée, Statique, Mini-figurine…",
      franchise: "Marvel, Star Wars, Toy Story…",
      studio: "Hasbro, Bandai, NECA…",
    },
    suggestedCategoryNames: ["Figurine", "Figurine articulée", "Figurine statique"],
    hint: "Renseignez la franchise et le(s) personnage(s) représenté(s).",
  },

  // ── 🟣 PELUCHE ──────────────────────────────────────────────────────────────
  // Le personnage est l'info principale. Studio peu pertinent (souvent inconnu).
  peluche: {
    id: "peluche",
    label: "Peluche",
    emoji: "🟣",
    primaryFields: [],
    detailsFirstFields: ["characters", "franchise", "license"],
    hiddenFields: ["numero", "nb_pieces", "subcategory", "studio", "taille"],
    autoOpenDetails: true,
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
    hint: "Quel personnage est représenté ? De quelle franchise ?",
  },

  // ── 🟢 PLAYMOBIL ────────────────────────────────────────────────────────────
  // Numéro de set et pièces en priorité. Pas de personnage spécifique (personnages génériques).
  playmobil: {
    id: "playmobil",
    label: "Playmobil",
    emoji: "🟢",
    primaryFields: ["numero", "nb_pieces"],
    detailsFirstFields: ["subcategory", "franchise"],
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
    hint: "Notez le numéro de set et le nombre de pièces pour retrouver facilement la boîte.",
  },

  // ── ⚙️ JEUX DE CONSTRUCTION (Meccano, K'nex, etc.) ──────────────────────
  meccano: {
    id: "meccano",
    label: "Jeux de construction",
    emoji: "⚙️",
    primaryFields: ["numero", "nb_pieces"],
    detailsFirstFields: ["subcategory", "franchise"],
    hiddenFields: ["taille", "characters"],
    autoOpenDetails: false,
    fieldLabels: {
      numero: "Numéro de modèle",
      nb_pieces: "Nombre de pièces",
      subcategory: "Type de construction",
      location: "Lieu d'achat",
    },
    suggestedCategoryNames: ["Construction", "Maquette"],
    hint: "Indiquez le numéro de modèle et le nombre de pièces.",
  },

  // ── 🧊 PUZZLE 3D ────────────────────────────────────────────────────────────
  puzzle3d: {
    id: "puzzle3d",
    label: "Puzzle 3D",
    emoji: "🧊",
    primaryFields: ["numero", "nb_pieces"],
    detailsFirstFields: ["studio", "license"],
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
    hint: "Renseignez la référence et le nombre de pièces.",
  },

  // ── 🚗 VÉHICULE / MODÈLE RÉDUIT ─────────────────────────────────────────────
  // Numéro de série ou référence. Le fabricant (studio) et la gamme sont clés.
  vehicule: {
    id: "vehicule",
    label: "Véhicule / Modèle réduit",
    emoji: "🚗",
    primaryFields: ["numero"],
    detailsFirstFields: ["subcategory", "studio", "franchise"],
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
    hint: "Précisez le fabricant et la gamme pour mieux catégoriser.",
  },

  // ── 🏖️ SOUVENIR / VOYAGE ────────────────────────────────────────────────────
  // Le lieu de provenance est l'info la plus importante.
  // Pas de numéro, pas de franchise — c'est un souvenir personnel.
  souvenir: {
    id: "souvenir",
    label: "Souvenir / Voyage",
    emoji: "🏖️",
    primaryFields: [],
    detailsFirstFields: ["location", "subcategory"],
    hiddenFields: ["numero", "nb_pieces", "studio", "license", "franchise", "characters"],
    autoOpenDetails: true,
    fieldLabels: {
      location: "Lieu de provenance",
      subcategory: "Type de souvenir",
    },
    fieldPlaceholders: {
      location: "Bretagne, Disneyland Paris, Tokyo…",
      subcategory: "Phare, Magnet, Carte postale…",
    },
    suggestedCategoryNames: ["Souvenir", "Phare", "Décoration"],
    hint: "D'où vient ce souvenir ? C'est l'info la plus précieuse.",
  },

  // ── ⚪ DÉFAUT ────────────────────────────────────────────────────────────────
  // Aucune adaptation — tous les champs disponibles dans leur ordre habituel.
  default: {
    id: "default",
    label: "Par défaut",
    emoji: "⚪",
    primaryFields: [],
    detailsFirstFields: [],
    hiddenFields: [],
    autoOpenDetails: false,
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

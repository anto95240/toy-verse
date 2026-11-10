import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import {
  getThemeProfile,
  getFieldLabel,
  themeHasOccasionYear,
  giftOccasionLabel,
  formatReleaseYear,
  type FieldKey,
  type ThemeProfile,
} from "@/lib/themeProfile";

/**
 * Sub-components for ToyCard — aperçu adapté au profil du thème.
 */

export const NumberBadge = ({ n }: { n: string }) => (
  <div className="absolute top-3 left-3 z-30 bg-foreground text-background px-3 py-1.5 rounded-lg shadow-md font-title font-bold text-sm border border-background/20">
    #{n}
  </div>
);

type ToyLike = {
  studio?: string | null;
  categorie?: string | null;
  numero?: string | null;
  nb_pieces?: number | string | null;
  release_date?: string | number | null;
  gift_year?: string | number | null;
  gift_occasion?: string | null;
  taille?: string | number | null;
  theme_name?: string | null;
  v2_data?: any;
};

function resolveToyFields(toy: ToyLike) {
  const v2 = toy.v2_data;
  return {
    category: v2?.category_ids?.[0]?.name || toy.categorie || null,
    subcategory: v2?.category_ids?.[1]?.name || null,
    studio: v2?.studio_ids?.[0]?.name || toy.studio || null,
    franchise: v2?.franchise_ids?.[0]?.name || null,
    license: v2?.license_ids?.[0]?.name || null,
    characters: (v2?.character_ids?.map((c: any) => c.name) ?? []).filter(Boolean) as string[],
    location: v2?.location_ids?.[0]?.name || null,
    numero: toy.numero || null,
    nb_pieces: toy.nb_pieces ?? null,
    taille: toy.taille ?? null,
  };
}

function glanceKeys(profile: ThemeProfile): FieldKey[] {
  const keys: FieldKey[] = [];
  for (const f of [...profile.primaryFields, ...profile.detailsFirstFields]) {
    if (!keys.includes(f) && !profile.hiddenFields.includes(f)) keys.push(f);
  }
  // Fallback générique si profil vide
  if (keys.length === 0) {
    return (["studio", "subcategory", "franchise", "nb_pieces"] as FieldKey[]).filter(
      (f) => !profile.hiddenFields.includes(f)
    );
  }
  return keys;
}

/** Ligne principale : catégorie + champs glance du profil */
export const ToyCategories = ({
  toy,
  themeName,
}: {
  toy: ToyLike;
  themeName?: string | null;
}) => {
  const profile = useMemo(
    () => getThemeProfile(themeName || toy.theme_name || ""),
    [themeName, toy.theme_name]
  );
  const fields = resolveToyFields(toy);
  const keys = glanceKeys(profile);

  const parts: { label?: string; text: string; strong?: boolean }[] = [];

  if (fields.category) {
    parts.push({ text: fields.category, strong: true });
  }

  for (const key of keys) {
    if (key === "subcategory" && fields.subcategory) {
      // Fusionné avec la catégorie si déjà affichée
      if (parts.length > 0 && parts[0].text === fields.category) {
        parts[0].text = `${fields.category} / ${fields.subcategory}`;
      } else {
        parts.push({
          label: getFieldLabel(profile, "subcategory") || undefined,
          text: fields.subcategory,
        });
      }
    } else if (key === "studio" && fields.studio) {
      parts.push({ text: fields.studio, strong: true });
    } else if (key === "franchise" && fields.franchise) {
      parts.push({ text: fields.franchise });
    } else if (key === "license" && fields.license) {
      parts.push({ text: fields.license });
    } else if (key === "characters" && fields.characters.length > 0) {
      parts.push({ text: fields.characters.slice(0, 2).join(", ") });
    } else if (key === "location" && fields.location) {
      parts.push({
        label: getFieldLabel(profile, "location") || undefined,
        text: fields.location,
        strong: true,
      });
    }
  }

  // Dédupliquer texts identiques
  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    if (seen.has(p.text)) return false;
    seen.add(p.text);
    return true;
  });

  if (unique.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 mb-3 sm:mb-4 items-center text-xs sm:text-sm">
      {unique.map((p, i) => (
        <span
          key={`${p.text}-${i}`}
          className={
            p.strong
              ? "font-semibold uppercase tracking-wide text-primary/80"
              : "text-muted-foreground/80"
          }
        >
          {i > 0 && <span className="text-muted-foreground/40 mr-2">·</span>}
          {p.label ? `${p.label} : ${p.text}` : p.text}
        </span>
      ))}
    </div>
  );
};

export const ToyTags = ({
  toy,
}: {
  toy: { is_exposed?: boolean | null; is_soon?: boolean | null };
}) => (
  <div className="flex gap-2">
    {toy.is_exposed && (
      <span
        className="text-[10px] uppercase font-bold bg-green-500/15 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-500/20 sm:w-2.5 sm:h-2.5 sm:p-0 sm:bg-green-500 sm:border-0"
        title="Exposé"
      >
        <span className="sm:hidden">Exposé</span>
      </span>
    )}
    {toy.is_soon && (
      <span
        className="text-[10px] uppercase font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 sm:w-2.5 sm:h-2.5 sm:p-0 sm:bg-purple-500 sm:border-0"
        title="Wishlist"
      >
        <span className="sm:hidden">Wishlist</span>
      </span>
    )}
  </div>
);

/** Specs secondaires selon le profil (pièces / année / taille / numéro si pas en badge) */
export const ToySpecs = ({
  toy,
  themeName,
  hideNumero = false,
}: {
  toy: ToyLike;
  themeName?: string | null;
  hideNumero?: boolean;
}) => {
  const profile = useMemo(
    () => getThemeProfile(themeName || toy.theme_name || ""),
    [themeName, toy.theme_name]
  );
  const fields = resolveToyFields(toy);
  const show = (key: FieldKey) => !profile.hiddenFields.includes(key);

  const chips: { key: string; text: string; tone: "neutral" | "release" | "occasion" }[] = [];
  if (!hideNumero && show("numero") && fields.numero) {
    chips.push({ key: "numero", text: `#${fields.numero}`, tone: "neutral" });
  }
  if (show("nb_pieces") && fields.nb_pieces != null && fields.nb_pieces !== "") {
    chips.push({ key: "pieces", text: `${fields.nb_pieces} p.`, tone: "neutral" });
  }
  const releaseYear = formatReleaseYear(toy.release_date);
  if (releaseYear) {
    chips.push({ key: "release", text: `Sortie ${releaseYear}`, tone: "release" });
  }
  const splitYears = themeHasOccasionYear(themeName || toy.theme_name || "");
  if (splitYears && (toy.gift_occasion || (toy.gift_year != null && toy.gift_year !== ""))) {
    const label = giftOccasionLabel(toy.gift_occasion) || "Occasion";
    const giftYear = formatReleaseYear(toy.gift_year);
    chips.push({
      key: "occasion",
      text: giftYear ? `${label} ${giftYear}` : label,
      tone: "occasion",
    });
  }
  if (show("taille") && fields.taille != null && fields.taille !== "") {
    chips.push({ key: "taille", text: String(fields.taille), tone: "neutral" });
  }

  if (chips.length === 0) return null;

  const toneClass = {
    neutral: "bg-secondary/60 border-border/50 text-muted-foreground",
    release: "bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200",
    occasion: "bg-amber-500/15 border-amber-500/35 text-amber-900 dark:text-amber-100",
  };

  return (
    <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`border px-2.5 py-1.5 rounded-lg line-clamp-2 break-words font-medium ${toneClass[chip.tone]}`}
        >
          {chip.text}
        </span>
      ))}
    </div>
  );
};

export const ToyActionButtons = ({
  onEdit,
  onDelete,
  className = "",
}: {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) => (
  <div className={`flex gap-1 shrink-0 ${className}`}>
    <button
      aria-label="modification d'un jouet"
      onClick={onEdit}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20"
    >
      <FontAwesomeIcon icon={faPen} className="text-xs" />
    </button>
    <button
      aria-label="suppression d'un jouet"
      onClick={onDelete}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
    >
      <FontAwesomeIcon icon={faTrash} className="text-xs" />
    </button>
  </div>
);

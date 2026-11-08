"use client";

import React, { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import {
  getThemeProfile,
  getFieldLabel,
  themeHasOccasionYear,
  releaseYearLabel,
  giftOccasionLabel,
  type FieldKey,
  type ThemeProfile,
} from "@/lib/themeProfile";

type DisplayKey = FieldKey | "category" | "release_year" | "gift_year";

interface DetailRow {
  key: DisplayKey;
  label: string;
  value: string;
}

interface ToyDetailsModalProps {
  toy: any;
  isOpen: boolean;
  onClose: () => void;
  themeName?: string | null;
  themeProfileId?: string | null;
}

function resolveProfile(themeName?: string | null): ThemeProfile {
  return getThemeProfile(themeName || "");
}

/**
 * Essentiels = catégorie + primaryFields + année (toujours importante).
 * Plus de détails = detailsFirst + autres champs non masqués avec valeur.
 * Le bouton n'apparaît que s'il y a vraiment des champs secondaires.
 */
function buildRows(toy: any, profile: ThemeProfile, themeName: string): { primary: DetailRow[]; secondary: DetailRow[] } {
  const v2 = toy.v2_data;
  const category = v2?.category_ids?.[0]?.name || toy.categorie || null;
  const subcategory = v2?.category_ids?.[1]?.name || null;
  const studio = v2?.studio_ids?.[0]?.name || toy.studio || null;
  const franchise = v2?.franchise_ids?.[0]?.name || null;
  const license = v2?.license_ids?.[0]?.name || null;
  const characters = (v2?.character_ids?.map((c: any) => c.name) ?? []).filter(Boolean);
  const location = v2?.location_ids?.[0]?.name || null;
  const year = toy.release_date || toy.metadata?.release_date || null;
  const giftYear = toy.gift_year || toy.metadata?.gift_year || null;
  const occasionLabel = giftOccasionLabel(toy.gift_occasion || toy.metadata?.gift_occasion);
  const splitYears = themeHasOccasionYear(themeName);

  const valueByKey: Partial<Record<DisplayKey, string | null>> = {
    category,
    subcategory,
    studio,
    franchise,
    license,
    characters: characters.length > 0 ? characters.join(", ") : null,
    location,
    numero: toy.numero ? String(toy.numero) : toy.metadata?.numero ? String(toy.metadata.numero) : null,
    nb_pieces:
      toy.nb_pieces != null
        ? `${toy.nb_pieces} pièces`
        : toy.metadata?.nb_pieces != null
          ? `${toy.metadata.nb_pieces} pièces`
          : null,
    taille: toy.taille || toy.metadata?.taille || null,
    release_year: year != null ? String(year) : null,
    gift_year: !splitYears
      ? null
      : giftYear != null
        ? String(giftYear)
        : occasionLabel,
  };

  const defaultLabels: Record<DisplayKey, string> = {
    category: "Catégorie",
    subcategory: "Sous-catégorie",
    studio: "Studio",
    franchise: "Franchise",
    license: "Licence",
    characters: "Personnage(s)",
    location: "Lieu d'achat",
    numero: "Numéro",
    nb_pieces: "Pièces",
    taille: "Taille",
    release_year: splitYears ? "Année de sortie" : "Année",
    gift_year: "Occasion",
  };

  const labelFor = (key: DisplayKey): string => {
    if (key === "category") return "Catégorie";
    if (key === "release_year") return releaseYearLabel(themeName);
    if (key === "gift_year") return occasionLabel && giftYear != null ? occasionLabel : "Occasion";
    return getFieldLabel(profile, key) ?? defaultLabels[key];
  };

  const hidden = new Set<string>(profile.hiddenFields);

  // Ordre essentiels : catégorie → primaryFields → année
  const essentialOrder: DisplayKey[] = ["category"];
  for (const f of profile.primaryFields) {
    if (!essentialOrder.includes(f) && !hidden.has(f)) essentialOrder.push(f);
  }
  essentialOrder.push("release_year");
  if (splitYears) essentialOrder.push("gift_year");

  // Secondaires : detailsFirst puis le reste non essentiel / non masqué
  const secondaryOrder: DisplayKey[] = [];
  for (const f of profile.detailsFirstFields) {
    if (!essentialOrder.includes(f) && !hidden.has(f) && !secondaryOrder.includes(f)) {
      secondaryOrder.push(f);
    }
  }
  const rest: DisplayKey[] = [
    "subcategory",
    "studio",
    "franchise",
    "license",
    "characters",
    "location",
    "numero",
    "nb_pieces",
    "taille",
  ];
  for (const f of rest) {
    if (
      !essentialOrder.includes(f) &&
      !secondaryOrder.includes(f) &&
      !hidden.has(f)
    ) {
      secondaryOrder.push(f);
    }
  }

  const primary: DetailRow[] = [];
  const secondary: DetailRow[] = [];

  for (const key of essentialOrder) {
    const value = valueByKey[key];
    if (!value) continue;
    primary.push({ key, label: labelFor(key), value });
  }

  for (const key of secondaryOrder) {
    const value = valueByKey[key];
    if (!value) continue;
    secondary.push({ key, label: labelFor(key), value });
  }

  if (primary.length === 0 && secondary.length > 0) {
    return { primary: secondary, secondary: [] };
  }

  return { primary, secondary };
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-muted-foreground uppercase tracking-wider shrink-0 pt-0.5 w-28">
        {label}
      </span>
      <span
        className={`text-sm text-right ${
          emphasize ? "text-foreground font-semibold" : "text-foreground/90"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function ToyDetailsModal({
  toy,
  isOpen,
  onClose,
  themeName,
  themeProfileId,
}: ToyDetailsModalProps) {
  const [showMore, setShowMore] = useState(false);

  const profile = useMemo(
    () => resolveProfile(themeName || toy?.theme_name || toy?.themeName),
    [themeName, themeProfileId, toy]
  );

  const { primary, secondary } = useMemo(
    () =>
      toy
        ? buildRows(toy, profile, themeName || toy?.theme_name || toy?.themeName || "")
        : { primary: [], secondary: [] },
    [toy, profile, themeName]
  );

  const customEntries = useMemo(() => {
    if (!toy) return [];
    const raw = toy.custom_fields || toy.custom_fields_values;
    if (!raw || typeof raw !== "object") return [];
    return Object.entries(raw)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([key, val]) => {
        const label = toy.customFieldsDef?.find((f: any) => f.id === key)?.label || key;
        return { label, value: String(val) };
      });
  }, [toy]);

  if (!toy) return null;

  // Bouton uniquement s'il reste des infos secondaires utiles
  const hasMore = secondary.length > 0 || customEntries.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails du jouet">
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{toy.nom}</h3>
          {(toy.theme_name || toy.themeName) && (
            <span className="inline-block bg-secondary text-muted-foreground text-xs px-2.5 py-1 rounded-md border border-border">
              {toy.theme_name || toy.themeName}
            </span>
          )}
        </div>

        {primary.length > 0 && (
          <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
            {primary.map((row) => (
              <Row key={row.key} label={row.label} value={row.value} emphasize />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              <span className={`transition-transform ${showMore ? "rotate-180" : ""}`}>▾</span>
              {showMore ? "Masquer les détails" : "Plus de détails"}
            </button>

            {showMore && (
              <div className="rounded-xl border border-border/60 bg-background/40 p-4 space-y-3">
                {secondary.map((row) => (
                  <Row key={`${row.key}-${row.label}`} label={row.label} value={row.value} />
                ))}
                {customEntries.map((entry) => (
                  <Row key={entry.label} label={entry.label} value={entry.value} />
                ))}
              </div>
            )}
          </div>
        )}

        {(toy.is_exposed || toy.is_soon) && (
          <div className="flex flex-wrap gap-2">
            {toy.is_exposed && (
              <span className="text-xs px-2.5 py-1 rounded-md border border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10">
                Exposé
              </span>
            )}
            {toy.is_soon && (
              <span className="text-xs px-2.5 py-1 rounded-md border border-violet-500/30 text-violet-600 dark:text-violet-400 bg-violet-500/10">
                Prochainement
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

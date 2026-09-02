/**
 * lib/themeProfileCompat.ts
 *
 * Couche de compatibilité entre les profils "legacy" codés en dur
 * et les profils en base de données (ThemeProfileDB).
 *
 * Permet à ToyForm/ThemeForm de fonctionner avec les deux formats
 * pendant la période de transition.
 */

import type { ThemeProfile, FieldKey } from "@/lib/themeProfile";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

/**
 * Convertit un ThemeProfileDB (base de données) vers le format ThemeProfile
 * utilisé par ToyForm et useToyForm.
 */
export function dbProfileToThemeProfile(db: ThemeProfileDB): ThemeProfile {
  return {
    id:                  db.id,
    label:               db.label,
    emoji:               db.emoji,
    primaryFields:       (db.primary_fields ?? []) as FieldKey[],
    detailsFirstFields:  (db.details_first_fields ?? []) as FieldKey[],
    hiddenFields:        (db.hidden_fields ?? []) as FieldKey[],
    fieldLabels:         (db.field_labels ?? {}) as Partial<Record<FieldKey, string>>,
    fieldPlaceholders:   (db.field_placeholders ?? {}) as Partial<Record<FieldKey, string>>,
    suggestedCategoryNames: db.suggested_category_names ?? [],
    hint:                db.hint ?? undefined,
    autoOpenDetails:     db.auto_open_details,
  };
}

/**
 * Convertit un ThemeProfile (legacy) vers le format ThemeProfileDB
 * (pour le script de migration des données).
 */
export function themeProfileToDbInput(
  p: ThemeProfile,
  userId: string
): Omit<ThemeProfileDB, "id" | "created_at" | "updated_at"> {
  return {
    user_id:               userId,
    label:                 p.label,
    emoji:                 p.emoji,
    primary_fields:        p.primaryFields,
    details_first_fields:  p.detailsFirstFields,
    hidden_fields:         p.hiddenFields,
    field_labels:          (p.fieldLabels ?? {}) as Record<string, string>,
    field_placeholders:    (p.fieldPlaceholders ?? {}) as Record<string, string>,
    suggested_category_names: p.suggestedCategoryNames ?? [],
    hint:                  p.hint ?? null,
    auto_open_details:     p.autoOpenDetails,
    custom_fields_definition: p.custom_fields_definition ?? [],
  };
}

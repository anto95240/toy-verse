"use client";

import React from "react";
import type { Toy } from "@/types/theme";
import { FormInput } from "@/components/ui/FormInput";
import SmartSelect, { type SmartSelectItem } from "@/components/ui/SmartSelect";
import SmartSelectMulti from "@/components/ui/SmartSelectMulti";
import SuggestionBanner, { type Suggestion } from "@/components/ui/SuggestionBanner";
import {
  getThemeProfile,
  ALL_PROFILES,
  themeHasOccasionYear,
  releaseYearLabel,
  type ThemeProfile,
  type FieldKey,
} from "@/lib/themeProfile";
import { useToyForm } from "@/hooks/toys/useToyForm";
import { ToyFormImageSection } from "./ToyFormImageSection";
import { OccasionYearField } from "./OccasionYearField";
import { dbProfileToThemeProfile } from "@/lib/themeProfileCompat";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

export type ToyFormValues = Omit<Toy, "id" | "created_at"> & {
  _v2_category: SmartSelectItem | null;
  _v2_subcategory: SmartSelectItem | null;
  _v2_studio: SmartSelectItem | null;
  _v2_license: SmartSelectItem | null;
  _v2_franchise: SmartSelectItem | null;
  _v2_characters: SmartSelectItem[];
  _v2_location: SmartSelectItem | null;
  custom_fields_values?: Record<string, unknown> | null;
};

interface ToyFormProps {
  form: ToyFormValues;
  setForm: React.Dispatch<React.SetStateAction<ToyFormValues>>;
  themeName: string;
  themeProfileId?: string | null;
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setShowImagePopup: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEditMode?: boolean;
}

export function createEmptyToyFormValues(
  themeId: string,
  userId: string
): ToyFormValues {
  return {
    theme_id: themeId,
    user_id: userId,
    nom: "",
    taille: null,
    nb_pieces: null,
    numero: null,
    is_exposed: false,
    is_soon: false,
    photo_url: null,
    categorie: null,
    studio: "",
    release_date: null,
    gift_occasion: null,
    gift_year: null,
    category_ids: [],
    studio_ids: [],
    license_ids: [],
    franchise_ids: [],
    character_ids: [],
    location_ids: [],
    _v2_category: null,
    _v2_subcategory: null,
    _v2_studio: null,
    _v2_license: null,
    _v2_franchise: null,
    _v2_characters: [],
    _v2_location: null,
    custom_fields_values: {},
  };
}

export function serializeToyFormValues(
  form: ToyFormValues
): Omit<Toy, "id" | "created_at"> {
  const legacyStudioParts: string[] = [];
  if (form._v2_studio) legacyStudioParts.push(form._v2_studio.name);
  if (form._v2_license) legacyStudioParts.push(form._v2_license.name);
  if (form._v2_franchise) legacyStudioParts.push(form._v2_franchise.name);
  const legacyStudio = legacyStudioParts.length > 0
    ? legacyStudioParts.join(" / ")
    : form.studio || "";

  return {
    theme_id: form.theme_id,
    user_id: form.user_id,
    nom: form.nom,
    taille: form.taille,
    nb_pieces: form.nb_pieces,
    numero: form.numero,
    is_exposed: form.is_exposed,
    is_soon: form.is_soon,
    photo_url: form.photo_url,
    release_date: form.release_date,
    gift_occasion: form.gift_occasion ?? null,
    gift_year: form.gift_occasion ? form.gift_year ?? null : null,
    categorie: form._v2_category?.name ?? form.categorie,
    studio: legacyStudio,
    category_ids: [
      ...(form._v2_category ? [form._v2_category.id] : []),
      ...(form._v2_subcategory ? [form._v2_subcategory.id] : []),
    ],
    studio_ids: form._v2_studio ? [form._v2_studio.id] : [],
    license_ids: form._v2_license ? [form._v2_license.id] : [],
    franchise_ids: form._v2_franchise ? [form._v2_franchise.id] : [],
    character_ids: form._v2_characters.map((c) => c.id),
    location_ids: form._v2_location ? [form._v2_location.id] : [],
    custom_fields_values: form.custom_fields_values || {},
  };
}

const ALL_FIELDS: FieldKey[] = [
  "numero",
  "nb_pieces",
  "subcategory",
  "franchise",
  "characters",
  "studio",
  "license",
  "taille",
  "location"
];

export default function ToyForm({
  form,
  setForm,
  themeName,
  themeProfileId,
  previewUrl,
  setPreviewUrl,
  setShowImagePopup,
  loading,
  onSubmit,
  onClose,
  isEditMode = false,
}: ToyFormProps) {
  const legacyProfile = themeProfileId
    ? (ALL_PROFILES.find((p) => p.id === themeProfileId) || getThemeProfile(themeName))
    : getThemeProfile(themeName);

  const [profile, setProfile] = React.useState<ThemeProfile>(legacyProfile);

  React.useEffect(() => {
    if (!themeProfileId) { setProfile(getThemeProfile(themeName)); return; }
    const isUuid = themeProfileId.includes("-") && themeProfileId.length > 20;
    if (!isUuid) { setProfile(legacyProfile); return; }

    fetch("/api/profile/theme-profiles")
      .then((r) => r.json())
      .then((json) => {
        const found = (json.profiles as ThemeProfileDB[]).find((p) => p.id === themeProfileId);
        if (found) setProfile(dbProfileToThemeProfile(found));
      })
      .catch(() => { });
  }, [themeProfileId, themeName]);

  const {
    showDetails,
    setShowDetails,
    suggestions,
    photoLater,
    setPhotoLater,
    updateField,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleAcceptAllSuggestions,
    isPrimary,
    isInDetails,
    isHidden,
    lbl,
    ph,
    isAILoading,
  } = useToyForm(form, setForm, profile, isEditMode);

  const shouldShowField = (field: FieldKey): boolean => !isHidden(field);

  // Essentiels = primary ; Plus de détails = tout le reste visible (detailsFirst en tête)
  const essentialFields = ALL_FIELDS.filter((f) => isPrimary(f) && shouldShowField(f));
  const secondaryFields = ALL_FIELDS.filter((f) => !isPrimary(f) && shouldShowField(f));

  const renderField = (field: FieldKey) => {
    switch (field) {
      case "subcategory":
        return (
          <SmartSelect
            key="subcategory"
            id="subcategory"
            entityType="category"
            label={lbl("subcategory", "Sous-catégorie")}
            placeholder={
              form._v2_category
                ? `Sous-catégorie de ${form._v2_category.name}...`
                : "Choisir d'abord une catégorie..."
            }
            value={form._v2_subcategory}
            onChange={(item) => updateField("_v2_subcategory", item)}
            disabled={loading || !form._v2_category}
          />
        );
      case "studio":
        return (
          <SmartSelect
            key="studio"
            id="studio"
            entityType="studio"
            label={lbl("studio", "Studio")}
            placeholder={ph("studio", "Rechercher un studio...")}
            value={form._v2_studio}
            onChange={(item) => updateField("_v2_studio", item)}
            disabled={loading}
          />
        );
      case "license":
        return (
          <SmartSelect
            key="license"
            id="license"
            entityType="license"
            label={lbl("license", "Licence")}
            placeholder={ph("license", "Rechercher une licence...")}
            value={form._v2_license}
            onChange={(item) => updateField("_v2_license", item)}
            disabled={loading}
          />
        );
      case "franchise":
        return (
          <SmartSelect
            key="franchise"
            id="franchise"
            entityType="franchise"
            label={lbl("franchise", "Franchise")}
            placeholder={ph("franchise", "Rechercher une franchise...")}
            value={form._v2_franchise}
            onChange={(item) => updateField("_v2_franchise", item)}
            disabled={loading}
          />
        );
      case "characters":
        return (
          <SmartSelectMulti
            key="characters"
            id="characters"
            entityType="character"
            label={lbl("characters", "Personnage(s)")}
            placeholder={ph("characters", "Ajouter un personnage...")}
            values={form._v2_characters}
            onChange={(items) => updateField("_v2_characters", items)}
            disabled={loading}
          />
        );
      case "location":
        return (
          <SmartSelect
            key="location"
            id="location"
            entityType="location"
            label={lbl("location", "Lieu d'achat")}
            placeholder={ph("location", "Disneyland Paris, Bretagne...")}
            value={form._v2_location}
            onChange={(item) => updateField("_v2_location", item)}
            disabled={loading}
          />
        );
      case "taille":
        return (
          <FormInput
            key="taille"
            id="taille"
            label={lbl("taille", "Taille")}
            value={form.taille || ""}
            onChange={(v) => updateField("taille", v)}
            disabled={loading}
          />
        );
      case "nb_pieces":
        return (
          <FormInput
            key="nb_pieces"
            id="nb_pieces"
            label={lbl("nb_pieces", "Nombre de pièces")}
            type="number"
            value={form.nb_pieces || ""}
            onChange={(v) => updateField("nb_pieces", v ? Number(v) : null)}
            disabled={loading}
            min={0}
          />
        );
      case "numero":
        return (
          <FormInput
            key="numero"
            id="numero"
            label={lbl("numero", "Numéro")}
            value={form.numero || ""}
            onChange={(v) => updateField("numero", v)}
            disabled={loading}
          />
        );
    }
    return null;
  };

  const updateCustomField = (id: string, value: unknown) => {
    updateField("custom_fields_values", {
      ...(form.custom_fields_values || {}),
      [id]: value
    });
  };

  const renderCustomFields = () => {
    const customFieldsDef = profile.custom_fields_definition || [];
    if (customFieldsDef.length === 0) return null;
    return (
      <div className="pt-2 space-y-4">
        {customFieldsDef.map((def) => {
          const val = form.custom_fields_values?.[def.id];
          
          if (def.type === "boolean") {
            return (
              <label key={def.id} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={!!val}
                  onChange={(e) => updateCustomField(def.id, e.target.checked)}
                  disabled={loading}
                  className="accent-blue-500"
                />
                <span>{def.label}</span>
              </label>
            );
          }
          
          if (def.type === "select") {
            return (
              <div key={def.id} className="space-y-1">
                <label className="text-sm font-medium text-gray-300 block">{def.label}</label>
                <select
                  value={(val as string) || ""}
                  onChange={(e) => updateCustomField(def.id, e.target.value)}
                  disabled={loading}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Sélectionner...</option>
                  {def.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (def.type === "textarea") {
            return (
              <div key={def.id} className="space-y-1">
                <label className="text-sm font-medium text-gray-300 block">{def.label}</label>
                <textarea
                  value={(val as string) || ""}
                  onChange={(e) => updateCustomField(def.id, e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            );
          }

          return (
            <FormInput
              key={def.id}
              id={def.id}
              label={def.label}
              type={def.type === "number" ? "number" : "text"}
              value={(val as string) || ""}
              onChange={(v) => updateCustomField(def.id, def.type === "number" ? (v ? Number(v) : null) : v)}
              disabled={loading}
            />
          );
        })}
      </div>
    );
  };

  const showDetailsSection =
    secondaryFields.length > 0 || (profile.custom_fields_definition?.length || 0) > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {profile.hint && (
        <p className="text-sm text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-2">
          {profile.hint}
        </p>
      )}

      <div className="relative">
        <FormInput
          id="nom"
          label="Nom"
          value={form.nom}
          onChange={(v) => updateField("nom", v)}
          disabled={loading}
          required
        />
        {isAILoading && (
          <div
            className="absolute right-3 top-[2.1rem] h-5 w-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin"
            title="Analyse IA…"
            aria-label="Analyse IA en cours"
          />
        )}
      </div>

      {/* ── ESSENTIELS ── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Essentiels — {profile.label}
        </p>
        <SmartSelect
          id="category"
          entityType="category"
          label="Catégorie"
          placeholder="Rechercher une catégorie…"
          value={form._v2_category}
          onChange={(item) => {
            updateField("_v2_category", item);
            // Reset sous-catégorie si la catégorie change
            if (form._v2_subcategory) updateField("_v2_subcategory", null);
          }}
          disabled={loading}
        />
        <div className="space-y-4">{essentialFields.map(renderField)}</div>
        <FormInput
          id="releaseDate"
          label={releaseYearLabel(themeName)}
          type="number"
          value={form.release_date || ""}
          onChange={(v) => updateField("release_date", v ? Number(v) : null)}
          disabled={loading}
          min={1900}
          max={2100}
        />
        {themeHasOccasionYear(themeName) && (
          <OccasionYearField
            occasion={form.gift_occasion}
            year={form.gift_year}
            disabled={loading}
            onOccasionChange={(occasion) => updateField("gift_occasion", occasion)}
            onYearChange={(year) => updateField("gift_year", year)}
          />
        )}
      </div>

      <ToyFormImageSection
        previewUrl={previewUrl}
        photoLater={photoLater}
        setPhotoLater={setPhotoLater}
        setShowImagePopup={setShowImagePopup}
      />

      <SuggestionBanner
        suggestions={suggestions}
        onAccept={handleAcceptSuggestion}
        onReject={handleRejectSuggestion}
        onAcceptAll={handleAcceptAllSuggestions}
      />

      {/* ── PLUS DE DÉTAILS (secondaires seulement) ── */}
      {showDetailsSection && (
        <>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <span className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}>
              ▾
            </span>
            {showDetails ? "Masquer les détails" : "Plus de détails"}
          </button>

          {showDetails && (
            <div className="space-y-4 pl-3 border-l-2 border-border">
              <p className="text-xs text-muted-foreground">
                Champs utiles mais secondaires pour ce thème.
              </p>
              {/* detailsFirst en premier, puis le reste */}
              {secondaryFields
                .slice()
                .sort((a, b) => {
                  const ai = isInDetails(a) ? 0 : 1;
                  const bi = isInDetails(b) ? 0 : 1;
                  return ai - bi;
                })
                .map(renderField)}
              {renderCustomFields()}
            </div>
          )}
        </>
      )}

      <div className="flex gap-6 mt-4">
        {(["is_exposed", "is_soon"] as const).map((field) => (
          <label key={field} className="flex items-center space-x-2 cursor-pointer text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={!!(form as Record<string, unknown>)[field]}
              onChange={(e) => updateField(field, e.target.checked)}
              disabled={loading}
              className="accent-primary"
            />
            <span>{field === "is_exposed" ? "Exposé" : "Prochainement"}</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-muted-foreground text-sm transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

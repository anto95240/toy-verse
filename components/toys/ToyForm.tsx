"use client";

/**
 * components/toys/ToyForm.tsx — V2
 *
 * Formulaire d'ajout/édition d'un jouet.
 *
 * Structure :
 *   [SIMPLE] Nom, Catégorie (SmartSelect), Univers (bouton "Ajouter"), Année, Photo
 *   [+ Plus de détails] Sous-catégorie, Studio, Licence, Franchise,
 *                       Personnages (multi), Lieu d'achat, Taille, Pièces, Numéro,
 *                       Exposé, Prochainement
 *
 * Rétrocompatibilité :
 *   - Les champs legacy `categorie` et `studio` sont toujours écrits (fallback)
 *   - Les champs V2 `*_ids` sont écrits en parallèle
 */

import React, { useState, useEffect } from "react";
import type { Toy } from "@/types/theme";
import Image from "next/image";
import { FormInput } from "@/components/ui/FormInput";
import SmartSelect, { type SmartSelectItem } from "@/components/ui/SmartSelect";
import { ToyFormDetailsSection } from "./ToyFormDetailsSection";
import { getThemeProfile, getFieldLabel, getFieldPlaceholder, isFieldHidden, ALL_PROFILES, type FieldKey, type ThemeProfile } from "@/lib/themeProfile";
import { useToyForm } from "@/hooks/toys/useToyForm";
import { ToyFormImageSection } from "./ToyFormImageSection";
import { dbProfileToThemeProfile } from "@/lib/themeProfileCompat";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

// =============================================================================
// Types
// =============================================================================

/** Valeurs du formulaire V2 (étend Toy avec les sélections structurées) */
export type ToyFormValues = Omit<Toy, "id" | "created_at"> & {
  // Sélections V2 (SmartSelect)
  _v2_category: SmartSelectItem | null;
  _v2_subcategory: SmartSelectItem | null;
  _v2_studio: SmartSelectItem | null;
  _v2_license: SmartSelectItem | null;
  _v2_franchise: SmartSelectItem | null;
  _v2_characters: SmartSelectItem[];
  _v2_location: SmartSelectItem | null;
  custom_fields_values?: Record<string, any> | null;
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

// =============================================================================
// Helpers
// =============================================================================

/**
 * Crée un ToyFormValues vide (valeurs par défaut).
 * À utiliser pour initialiser un nouveau jouet.
 */
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

/**
 * Transforme un ToyFormValues en données prêtes à écrire en BDD.
 * Maintient la rétrocompatibilité en remplissant les champs legacy.
 */
export function serializeToyFormValues(
  form: ToyFormValues
): Omit<Toy, "id" | "created_at"> {
  // Construction du champ legacy `studio` depuis les sélections V2
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
    // Legacy (toujours rempli — règle n°1)
    categorie: form._v2_category?.name ?? form.categorie,
    studio: legacyStudio,
    // V2
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

// =============================================================================
// Composant
// =============================================================================

export default function ToyForm({
  form,
  setForm,
  themeName,
  themeProfileId,
  previewUrl,
  setPreviewUrl,
  setFile,
  setShowImagePopup,
  loading,
  onSubmit,
  onClose,
  isEditMode = false,
}: ToyFormProps) {

  // ── Profil du thème ─────────────────────────────────────────────────────────
  // On commence par le profil legacy (synchrone) puis on tente de charger depuis la DB
  const legacyProfile = themeProfileId
    ? (ALL_PROFILES.find((p) => p.id === themeProfileId) || getThemeProfile(themeName))
    : getThemeProfile(themeName);

  const [profile, setProfile] = React.useState<ThemeProfile>(legacyProfile);

  // Charger le profil DB si l'ID est un UUID (pas un id legacy comme "lego")
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
  }, [themeProfileId, themeName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Utilisation du Hook ──────────────────────────────────────────────────────
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
  } = useToyForm(form, setForm, profile);

  /** Classe fond des inputs — bg-secondary (#334155 en dark mode) pour correspondre au design original */
  const inputCls = "bg-secondary";

  // ── rendu ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>

      {/* ──────────────────── SECTION SIMPLE (toujours visible) ──────────────── */}

      {/* Nom */}
      <FormInput
        id="nom"
        label="Nom"
        value={form.nom}
        onChange={(v) => updateField("nom", v)}
        disabled={loading}
        required
      />

      {/* Catégorie (SmartSelect) */}
      <SmartSelect
        id="category"
        entityType="category"
        label="Catégorie"
        placeholder="Rechercher une catégorie..."
        value={form._v2_category}
        onChange={(item) => {
          updateField("_v2_category", item);
          // Réinitialiser la sous-catégorie si la catégorie change
          if (!item || item.id !== form._v2_category?.id) {
            updateField("_v2_subcategory", null);
          }
        }}
        disabled={loading}
      />

      {/* Univers (bouton compact) */}
      {!showDetails && (
        <div>
          <p className="block text-sm font-medium text-gray-300 mb-1">Univers</p>
          {(form._v2_studio || form._v2_franchise || form._v2_license) ? (
            <div className="flex flex-wrap gap-1.5">
              {form._v2_studio && <UniversTag label="Studio" name={form._v2_studio.name} onRemove={() => updateField("_v2_studio", null)} />}
              {form._v2_license && <UniversTag label="Licence" name={form._v2_license.name} onRemove={() => updateField("_v2_license", null)} />}
              {form._v2_franchise && <UniversTag label="Franchise" name={form._v2_franchise.name} onRemove={() => updateField("_v2_franchise", null)} />}
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Modifier
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 text-sm hover:border-white/40 hover:text-gray-300 transition-all text-left"
            >
              + Ajouter Studio / Licence / Franchise...
            </button>
          )}
        </div>
      )}

      {/* Année */}
      <FormInput
        id="releaseDate"
        label="Année de sortie"
        type="number"
        value={form.release_date}
        onChange={(v) => updateField("release_date", v ? Number(v) : null)}
        disabled={loading}
        min={1900}
        max={2100}
      />

      {/* Photo */}
      <ToyFormImageSection
        previewUrl={previewUrl}
        photoLater={photoLater}
        setPhotoLater={setPhotoLater}
        setShowImagePopup={setShowImagePopup}
      />

      {/* ──────────────────── BOUTON "PLUS DE DÉTAILS" ────────────────────────── */}

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-gray-300 text-sm transition-all"
      >
        <span
          className={`transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`}
        >
          ▾
        </span>
        {showDetails ? "Masquer les détails" : "+ Plus de détails"}
      </button>

      {/* ──────────────────── SECTION DÉTAILS (masquée par défaut) ───────────── */}

      {showDetails && (
        <ToyFormDetailsSection
          form={form}
          updateField={updateField}
          loading={loading}
          suggestions={suggestions}
          handleAcceptSuggestion={handleAcceptSuggestion}
          handleRejectSuggestion={handleRejectSuggestion}
          handleAcceptAllSuggestions={handleAcceptAllSuggestions}
          customFieldsDef={profile.custom_fields_definition || []}
        />
      )}

      {/* ──────────────────── ACTIONS ─────────────────────────────────────────── */}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-gray-300 text-sm transition-all"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// =============================================================================
// Sous-composant : tag d'univers dans la vue condensée
// =============================================================================

function UniversTag({
  label,
  name,
  onRemove,
}: {
  label: string;
  name: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-white/10 border border-white/20 text-gray-300 text-xs px-2 py-0.5 rounded-full">
      <span className="text-gray-500">{label} :</span>
      <span className="text-white">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-white transition-colors ml-0.5 text-gray-400"
      >
        ×
      </button>
    </span>
  );
}

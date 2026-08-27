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
import SmartSelectMulti from "@/components/ui/SmartSelectMulti";
import SuggestionBanner, { type Suggestion } from "@/components/ui/SuggestionBanner";

// =============================================================================
// Types
// =============================================================================

/** Valeurs du formulaire V2 (étend Toy avec les sélections structurées) */
export type ToyFormValues = Omit<Toy, "id" | "created_at"> & {
  // Sélections V2 (SmartSelect)
  _v2_category:     SmartSelectItem | null;
  _v2_subcategory:  SmartSelectItem | null;
  _v2_studio:       SmartSelectItem | null;
  _v2_license:      SmartSelectItem | null;
  _v2_franchise:    SmartSelectItem | null;
  _v2_characters:   SmartSelectItem[];
  _v2_location:     SmartSelectItem | null;
};

interface ToyFormProps {
  form: ToyFormValues;
  setForm: React.Dispatch<React.SetStateAction<ToyFormValues>>;
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setShowImagePopup: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
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
  if (form._v2_studio)    legacyStudioParts.push(form._v2_studio.name);
  if (form._v2_license)   legacyStudioParts.push(form._v2_license.name);
  if (form._v2_franchise) legacyStudioParts.push(form._v2_franchise.name);
  const legacyStudio = legacyStudioParts.length > 0
    ? legacyStudioParts.join(" / ")
    : form.studio || "";

  return {
    theme_id:    form.theme_id,
    user_id:     form.user_id,
    nom:         form.nom,
    taille:      form.taille,
    nb_pieces:   form.nb_pieces,
    numero:      form.numero,
    is_exposed:  form.is_exposed,
    is_soon:     form.is_soon,
    photo_url:   form.photo_url,
    release_date: form.release_date,
    // Legacy (toujours rempli — règle n°1)
    categorie: form._v2_category?.name ?? form.categorie,
    studio:    legacyStudio,
    // V2
    category_ids:  [
      ...(form._v2_category    ? [form._v2_category.id]    : []),
      ...(form._v2_subcategory ? [form._v2_subcategory.id] : []),
    ],
    studio_ids:    form._v2_studio    ? [form._v2_studio.id]    : [],
    license_ids:   form._v2_license   ? [form._v2_license.id]   : [],
    franchise_ids: form._v2_franchise ? [form._v2_franchise.id] : [],
    character_ids: form._v2_characters.map((c) => c.id),
    location_ids:  form._v2_location  ? [form._v2_location.id]  : [],
  };
}

// =============================================================================
// Composant
// =============================================================================

export default function ToyForm({
  form,
  setForm,
  previewUrl,
  setPreviewUrl,
  setFile,
  setShowImagePopup,
  loading,
  onSubmit,
  onClose,
}: ToyFormProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  // Vérifier si le formulaire a des données V2 (pour afficher les détails)
  const hasV2Data =
    form._v2_subcategory ||
    form._v2_studio ||
    form._v2_license ||
    form._v2_franchise ||
    form._v2_characters.length > 0 ||
    form._v2_location;

  // Ouvrir automatiquement le panneau détails si des données V2 existent (mode édition)
  useEffect(() => {
    if (hasV2Data) setShowDetails(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch des suggestions croisées lors de la sélection d'un personnage
  useEffect(() => {
    if (form._v2_characters.length === 0) { setSuggestions([]); return; }

    const lastChar = form._v2_characters[form._v2_characters.length - 1];
    if (lastChar.id.startsWith("new:")) return; // pas de suggestion pour une nouvelle entrée

    fetch("/api/referential/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromEntity: "character", fromId: lastChar.id }),
    })
      .then((r) => r.json())
      .then((json) => {
        const newSuggestions: Suggestion[] = (json.suggestions ?? [])
          .filter((s: Suggestion) => {
            const key = `${s.entityType}-${s.item.id}`;
            return !rejectedSuggestions.has(key);
          })
          .filter((s: Suggestion) => {
            // Ne pas suggérer ce qui est déjà sélectionné
            if (s.entityType === "franchise" && form._v2_franchise?.id === s.item.id) return false;
            if (s.entityType === "studio"    && form._v2_studio?.id    === s.item.id) return false;
            if (s.entityType === "license"   && form._v2_license?.id   === s.item.id) return false;
            return true;
          });
        setSuggestions(newSuggestions);
      })
      .catch(() => setSuggestions([]));
  }, [form._v2_characters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── helpers ─────────────────────────────────────────────────────────────────

  function updateField<K extends keyof ToyFormValues>(field: K, value: ToyFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAcceptSuggestion(suggestion: Suggestion) {
    const item = suggestion.item as SmartSelectItem;
    switch (suggestion.entityType) {
      case "franchise": updateField("_v2_franchise", item); break;
      case "studio":    updateField("_v2_studio",    item); break;
      case "license":   updateField("_v2_license",   item); break;
      default: break;
    }
    setSuggestions((prev) =>
      prev.filter((s) => !(s.entityType === suggestion.entityType && s.item.id === suggestion.item.id))
    );
  }

  function handleRejectSuggestion(suggestion: Suggestion) {
    const key = `${suggestion.entityType}-${suggestion.item.id}`;
    setRejectedSuggestions((prev) => new Set(prev).add(key));
    setSuggestions((prev) =>
      prev.filter((s) => !(s.entityType === suggestion.entityType && s.item.id === suggestion.item.id))
    );
  }

  function handleAcceptAllSuggestions() {
    suggestions.forEach(handleAcceptSuggestion);
  }

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
              {form._v2_studio    && <UniversTag label="Studio" name={form._v2_studio.name}    onRemove={() => updateField("_v2_studio",    null)} />}
              {form._v2_license   && <UniversTag label="Licence" name={form._v2_license.name}   onRemove={() => updateField("_v2_license",   null)} />}
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
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Photo du jouet</label>
        <button
          type="button"
          onClick={() => setShowImagePopup(true)}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 text-blue-300 rounded-lg text-sm transition-all disabled:opacity-50"
        >
          {previewUrl ? "Changer l'image" : "Choisir une image"}
        </button>
        {previewUrl && (
          <div className="relative w-fit">
            <Image
              src={previewUrl}
              alt="Aperçu"
              width={500}
              height={500}
              className="max-h-48 object-contain rounded-lg border border-white/20"
            />
            <button
              type="button"
              onClick={() => { setPreviewUrl(null); setFile(null); updateField("photo_url", null); }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 text-sm"
            >
              ×
            </button>
          </div>
        )}
      </div>

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
        <div className="space-y-4 pl-3 border-l-2 border-white/10">

          {/* Sous-catégorie */}
          <SmartSelect
            id="subcategory"
            entityType="category"
            label="Sous-catégorie"
            placeholder={
              form._v2_category
                ? `Sous-catégorie de ${form._v2_category.name}...`
                : "Choisir d'abord une catégorie..."
            }
            value={form._v2_subcategory}
            onChange={(item) => updateField("_v2_subcategory", item)}
            disabled={loading || !form._v2_category}
          />

          {/* Studio */}
          <SmartSelect
            id="studio"
            entityType="studio"
            label="Studio"
            placeholder="Rechercher un studio..."
            value={form._v2_studio}
            onChange={(item) => updateField("_v2_studio", item)}
            disabled={loading}
          />

          {/* Licence */}
          <SmartSelect
            id="license"
            entityType="license"
            label="Licence"
            placeholder="Rechercher une licence..."
            value={form._v2_license}
            onChange={(item) => updateField("_v2_license", item)}
            disabled={loading}
          />

          {/* Franchise */}
          <SmartSelect
            id="franchise"
            entityType="franchise"
            label="Franchise"
            placeholder="Rechercher une franchise..."
            value={form._v2_franchise}
            onChange={(item) => updateField("_v2_franchise", item)}
            disabled={loading}
          />

          {/* Personnages (multi) */}
          <SmartSelectMulti
            id="characters"
            entityType="character"
            label="Personnage(s)"
            placeholder="Ajouter un personnage..."
            values={form._v2_characters}
            onChange={(items) => updateField("_v2_characters", items)}
            disabled={loading}
          />

          {/* Bandeau de suggestions croisées */}
          <SuggestionBanner
            suggestions={suggestions}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            onAcceptAll={handleAcceptAllSuggestions}
          />

          {/* Lieu d'achat */}
          <SmartSelect
            id="location"
            entityType="location"
            label="Lieu d'achat (souvenir)"
            placeholder="Disneyland Paris, Bretagne..."
            value={form._v2_location}
            onChange={(item) => updateField("_v2_location", item)}
            disabled={loading}
          />

          {/* Séparateur */}
          <hr className="border-white/10" />

          {/* Taille */}
          <FormInput
            id="taille"
            label="Taille"
            value={form.taille || ""}
            onChange={(v) => updateField("taille", v)}
            disabled={loading}
          />

          {/* Nombre de pièces */}
          <FormInput
            id="nb_pieces"
            label="Nombre de pièces"
            type="number"
            value={form.nb_pieces}
            onChange={(v) => updateField("nb_pieces", v ? Number(v) : null)}
            disabled={loading}
            min={0}
          />

          {/* Numéro */}
          <FormInput
            id="numero"
            label="Numéro"
            type="number"
            value={form.numero || ""}
            onChange={(v) => updateField("numero", v)}
            disabled={loading}
          />

          {/* Exposé / Prochainement */}
          <div className="flex gap-6">
            {(["is_exposed", "is_soon"] as const).map((field) => (
              <label key={field} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={!!form[field]}
                  onChange={(e) => updateField(field, e.target.checked)}
                  disabled={loading}
                  className="accent-blue-500"
                />
                <span>{field === "is_exposed" ? "Exposé" : "Prochainement"}</span>
              </label>
            ))}
          </div>
        </div>
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

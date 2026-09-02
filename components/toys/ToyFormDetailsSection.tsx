import React from "react";
import { FormInput } from "@/components/ui/FormInput";
import SmartSelect from "@/components/ui/SmartSelect";
import SmartSelectMulti from "@/components/ui/SmartSelectMulti";
import SuggestionBanner, { type Suggestion } from "@/components/ui/SuggestionBanner";
import type { ToyFormValues } from "./ToyForm";

import type { CustomFieldDefinition } from "@/app/actions/themeProfiles";

interface ToyFormDetailsSectionProps {
  form: ToyFormValues;
  updateField: (field: keyof ToyFormValues, value: any) => void;
  loading: boolean;
  suggestions: Suggestion[];
  handleAcceptSuggestion: (s: Suggestion) => void;
  handleRejectSuggestion: (suggestion: Suggestion) => void;
  handleAcceptAllSuggestions: () => void;
  customFieldsDef?: CustomFieldDefinition[];
}

export function ToyFormDetailsSection({
  form,
  updateField,
  loading,
  suggestions,
  handleAcceptSuggestion,
  handleRejectSuggestion,
  handleAcceptAllSuggestions,
  customFieldsDef = [],
}: ToyFormDetailsSectionProps) {
  
  const updateCustomField = (id: string, value: any) => {
    updateField("custom_fields_values", {
      ...(form.custom_fields_values || {}),
      [id]: value
    });
  };
  return (
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

      {/* --- Champs Personnalisés Dynamiques --- */}
      {customFieldsDef.length > 0 && (
        <div className="pt-4 space-y-4">
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
                    value={val || ""}
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
                    value={val || ""}
                    onChange={(e) => updateCustomField(def.id, e.target.value)}
                    disabled={loading}
                    rows={3}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              );
            }

            // text or number
            return (
              <FormInput
                key={def.id}
                id={def.id}
                label={def.label}
                type={def.type === "number" ? "number" : "text"}
                value={val || ""}
                onChange={(v) => updateCustomField(def.id, def.type === "number" ? (v ? Number(v) : null) : v)}
                disabled={loading}
              />
            );
          })}
        </div>
      )}

      {/* Exposé / Prochainement */}
      <div className="flex gap-6">
        {(["is_exposed", "is_soon"] as const).map((field) => (
          <label key={field} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-300">
            <input
              type="checkbox"
              checked={!!(form as any)[field]}
              onChange={(e) => updateField(field as any, e.target.checked)}
              disabled={loading}
              className="accent-blue-500"
            />
            <span>{field === "is_exposed" ? "Exposé" : "Prochainement"}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

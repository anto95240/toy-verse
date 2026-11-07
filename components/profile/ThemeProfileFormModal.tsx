"use client";

import React, { useState, useEffect } from "react";
import type { ThemeProfileDB, ThemeProfileInput } from "@/app/actions/themeProfiles";

export const ALL_FIELDS: { key: string; label: string; description: string }[] = [
  { key: "numero",     label: "Numéro",          description: "Numéro de set, référence, code produit" },
  { key: "nb_pieces",  label: "Nb. de pièces",   description: "Nombre de pièces / éléments" },
  { key: "subcategory",label: "Sous-catégorie",   description: "Gamme, type, collection" },
  { key: "franchise",  label: "Franchise",        description: "Univers, saga (ex : Star Wars)" },
  { key: "characters", label: "Personnages",       description: "Personnages représentés" },
  { key: "studio",     label: "Studio / Marque",  description: "Fabricant, éditeur, studio" },
  { key: "license",    label: "Licence",           description: "Licence officielle (ex: Disney)" },
  { key: "taille",     label: "Taille",            description: "Dimensions ou échelle" },
  { key: "location",   label: "Lieu d'achat",      description: "Où il a été acheté / trouvé" },
];

import { ThemeProfileTabGeneral } from "./ThemeProfileTabGeneral";
import { ThemeProfileTabFields } from "./ThemeProfileTabFields";
import { ThemeProfileTabLabels } from "./ThemeProfileTabLabels";
import { ThemeProfileTabCustomFields } from "./ThemeProfileTabCustomFields";

interface ThemeProfileFormModalProps {
  profile: ThemeProfileDB | null;
  onSave: (input: ThemeProfileInput) => void;
  onClose: () => void;
  isPending: boolean;
}

const defaultInput = (): ThemeProfileInput => ({
  label:                  "",
  emoji:                  "⚪",
  primary_fields:         [],
  details_first_fields:   [],
  hidden_fields:          [],
  field_labels:           {},
  field_placeholders:     {},
  suggested_category_names: [],
  hint:                   null,
  auto_open_details:      false,
  custom_fields_definition: [],
});

export default function ThemeProfileFormModal({ profile, onSave, onClose, isPending }: ThemeProfileFormModalProps) {
  const [form, setForm] = useState<ThemeProfileInput>(defaultInput());
  const [tab, setTab] = useState<"general" | "fields" | "labels" | "custom">("general");

  useEffect(() => {
    if (profile) {
      setForm({
        label:                  profile.label,
        emoji:                  profile.emoji,
        primary_fields:         profile.primary_fields ?? [],
        details_first_fields:   profile.details_first_fields ?? [],
        hidden_fields:          profile.hidden_fields ?? [],
        field_labels:           profile.field_labels ?? {},
        field_placeholders:     profile.field_placeholders ?? {},
        suggested_category_names: profile.suggested_category_names ?? [],
        hint:                   profile.hint,
        auto_open_details:      profile.auto_open_details,
        custom_fields_definition: profile.custom_fields_definition ?? [],
      });
    } else {
      setForm(defaultInput());
    }
    setTab("general");
  }, [profile]);

  function toggleField(fieldKey: string, list: "primary_fields" | "details_first_fields" | "hidden_fields") {
    setForm((prev) => {
      const current = prev[list] as string[];
      const next = current.includes(fieldKey)
        ? current.filter((f) => f !== fieldKey)
        : [...current, fieldKey];

      // Logique d'exclusivité : un champ ne peut pas être à la fois primary et hidden
      if (list === "primary_fields" && next.includes(fieldKey)) {
        return { ...prev, primary_fields: next, hidden_fields: (prev.hidden_fields as string[]).filter((f) => f !== fieldKey) };
      }
      if (list === "hidden_fields" && next.includes(fieldKey)) {
        return { ...prev, hidden_fields: next, primary_fields: (prev.primary_fields as string[]).filter((f) => f !== fieldKey), details_first_fields: (prev.details_first_fields as string[]).filter((f) => f !== fieldKey) };
      }
      return { ...prev, [list]: next };
    });
  }

  function setFieldLabel(fieldKey: string, value: string) {
    setForm((prev) => ({
      ...prev,
      field_labels: { ...(prev.field_labels as Record<string, string>), [fieldKey]: value },
    }));
  }

  function setFieldPlaceholder(fieldKey: string, value: string) {
    setForm((prev) => ({
      ...prev,
      field_placeholders: { ...(prev.field_placeholders as Record<string, string>), [fieldKey]: value },
    }));
  }

  const primaryFields   = form.primary_fields as string[];
  const detailsFields   = form.details_first_fields as string[];
  const hiddenFields    = form.hidden_fields as string[];
  const fieldLabels     = (form.field_labels as Record<string, string>) ?? {};
  const fieldPhs        = (form.field_placeholders as Record<string, string>) ?? {};

  const getFieldStatus = (key: string) => {
    if (hiddenFields.includes(key))  return "hidden";
    if (primaryFields.includes(key)) return "primary";
    if (detailsFields.includes(key)) return "details";
    return "normal";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {profile ? "Modifier le profil" : "Nouveau type de jouet"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-xl">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 overflow-x-auto custom-scrollbar">
          {(["general", "fields", "labels", "custom"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "general" ? "Général" : t === "fields" ? "Champs" : t === "labels" ? "Labels" : "Champs Persos"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* TAB : Général */}
          {tab === "general" && <ThemeProfileTabGeneral form={form} setForm={setForm} />}

          {/* TAB : Champs */}
          {tab === "fields" && <ThemeProfileTabFields getFieldStatus={getFieldStatus} toggleField={toggleField} />}

          {/* TAB : Labels personnalisés */}
          {tab === "labels" && (
            <ThemeProfileTabLabels
              hiddenFields={hiddenFields}
              fieldLabels={fieldLabels}
              fieldPhs={fieldPhs}
              setFieldLabel={setFieldLabel}
              setFieldPlaceholder={setFieldPlaceholder}
            />
          )}

          {/* TAB : Champs personnalisés */}
          {tab === "custom" && <ThemeProfileTabCustomFields form={form} setForm={setForm} />}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} disabled={isPending} className="btn-secondary flex-1 py-2.5">
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isPending || !form.label.trim()}
            className="btn-primary flex-1 py-2.5 disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : profile ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

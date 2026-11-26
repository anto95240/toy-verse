"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFont, faListCheck, faSliders, faXmark, faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
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

const TABS = [
  { id: "general", label: "Général", icon: faSliders, hint: "Nom du type et comportement du formulaire" },
  { id: "fields", label: "Champs", icon: faListCheck, hint: "Choisir ce qui est principal, en détail ou masqué" },
  { id: "labels", label: "Libellés", icon: faFont, hint: "Textes affichés pour chaque champ" },
  { id: "custom", label: "Perso", icon: faWandMagicSparkles, hint: "Champs supplémentaires propres à ce type" },
] as const;

const defaultInput = (): ThemeProfileInput => ({
  label:                  "",
  emoji:                  "",
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
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("general");

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

  const activeTab = TABS.find((item) => item.id === tab) ?? TABS[0];
  const activeIndex = TABS.findIndex((item) => item.id === tab);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh]">
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-5 pb-3 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Étape {activeIndex + 1} / {TABS.length}
            </p>
            <h2 className="text-lg font-bold text-foreground truncate">
              {profile ? "Modifier le type" : "Nouveau type de jouet"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 shrink-0 rounded-full bg-secondary text-foreground flex items-center justify-center"
            aria-label="Fermer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 px-4 sm:px-6 pb-3 shrink-0">
          {TABS.map((item, index) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 rounded-xl px-1 py-2 text-xs sm:text-sm font-semibold transition-colors flex flex-col items-center justify-center gap-1 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/70 text-muted-foreground"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-sm" />
                <span className="leading-none">{item.label}</span>
                <span className={`text-[10px] leading-none ${active ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        <p className="px-4 sm:px-6 pb-3 text-sm text-muted-foreground shrink-0">{activeTab.hint}</p>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 border-t border-border">
          {tab === "general" && <ThemeProfileTabGeneral form={form} setForm={setForm} />}
          {tab === "fields" && <ThemeProfileTabFields getFieldStatus={getFieldStatus} toggleField={toggleField} />}
          {tab === "labels" && (
            <ThemeProfileTabLabels
              hiddenFields={hiddenFields}
              fieldLabels={fieldLabels}
              fieldPhs={fieldPhs}
              setFieldLabel={setFieldLabel}
              setFieldPlaceholder={setFieldPlaceholder}
            />
          )}
          {tab === "custom" && <ThemeProfileTabCustomFields form={form} setForm={setForm} />}
        </div>

        <div className="flex gap-3 px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-border shrink-0 bg-card">
          <button onClick={onClose} disabled={isPending} className="btn-secondary flex-1 py-3">
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={isPending || !form.label.trim()}
            className="btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : profile ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

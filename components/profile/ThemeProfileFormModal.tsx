"use client";

import React, { useState, useEffect } from "react";
import type { ThemeProfileDB, ThemeProfileInput } from "@/app/actions/themeProfiles";

const ALL_FIELDS: { key: string; label: string; description: string }[] = [
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

const EMOJIS = ["⚪", "🟡", "🔵", "🟠", "🔴", "🟣", "🟢", "⚙️", "🧊", "🚗", "🏖️", "🎮", "🃏", "🏆", "🎨", "🧸"];

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
});

export default function ThemeProfileFormModal({ profile, onSave, onClose, isPending }: ThemeProfileFormModalProps) {
  const [form, setForm] = useState<ThemeProfileInput>(defaultInput());
  const [tab, setTab] = useState<"general" | "fields" | "labels">("general");

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
        <div className="flex border-b border-border px-6">
          {(["general", "fields", "labels"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "general" ? "Général" : t === "fields" ? "Champs" : "Labels"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* TAB : Général */}
          {tab === "general" && (
            <div className="space-y-5">
              {/* Emoji */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                      className={`w-10 h-10 rounded-xl text-xl transition-all border-2 ${
                        form.emoji === e ? "border-primary bg-primary/20" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nom */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-foreground">Nom du profil *</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="ex: Lego, Figurine, Cartes Pokémon…"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Hint */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-foreground">Conseil affiché à l&apos;utilisateur</label>
                <textarea
                  value={form.hint ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, hint: e.target.value || null }))}
                  placeholder="ex: Commencez par le numéro de set et le nombre de pièces."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Auto-open details */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.auto_open_details}
                  onChange={(e) => setForm((p) => ({ ...p, auto_open_details: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Ouvrir les détails automatiquement</p>
                  <p className="text-xs text-muted-foreground">Les champs secondaires s&apos;affichent dès l&apos;ouverture du formulaire</p>
                </div>
              </label>
            </div>
          )}

          {/* TAB : Champs */}
          {tab === "fields" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configurez la visibilité de chaque champ pour ce type de jouet.
              </p>

              {/* Légende */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary font-medium">⭐ Principal</span>
                <span className="px-2 py-1 rounded-full bg-secondary border border-border text-muted-foreground">Normal</span>
                <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">📋 Détails</span>
                <span className="px-2 py-1 rounded-full bg-muted/30 border border-muted text-muted-foreground line-through">Masqué</span>
              </div>

              <div className="space-y-2">
                {ALL_FIELDS.map(({ key, label, description }) => {
                  const status = getFieldStatus(key);
                  return (
                    <div key={key} className={`p-3 rounded-xl border transition-all ${
                      status === "hidden"  ? "bg-muted/10 border-muted/30 opacity-60" :
                      status === "primary" ? "bg-primary/10 border-primary/30" :
                      status === "details" ? "bg-blue-500/5 border-blue-500/20" :
                      "bg-secondary/30 border-border"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-medium ${status === "hidden" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {status === "primary" ? "⭐ " : status === "details" ? "📋 " : ""}{label}
                          </p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => toggleField(key, "primary_fields")}
                            title="Principal"
                            className={`px-2 py-1 rounded-lg text-xs border transition-all ${
                              status === "primary"
                                ? "bg-primary text-white border-primary"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                            }`}
                          >⭐</button>
                          <button
                            onClick={() => toggleField(key, "details_first_fields")}
                            title="Détails en premier"
                            disabled={status === "hidden"}
                            className={`px-2 py-1 rounded-lg text-xs border transition-all disabled:opacity-30 ${
                              status === "details"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-border text-muted-foreground hover:border-blue-500/50 hover:text-blue-400"
                            }`}
                          >📋</button>
                          <button
                            onClick={() => toggleField(key, "hidden_fields")}
                            title="Masquer"
                            className={`px-2 py-1 rounded-lg text-xs border transition-all ${
                              status === "hidden"
                                ? "bg-red-500/30 text-red-300 border-red-500/50"
                                : "border-border text-muted-foreground hover:border-red-500/50 hover:text-red-400"
                            }`}
                          >🚫</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB : Labels personnalisés */}
          {tab === "labels" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Personnalisez les étiquettes et les exemples affichés dans le formulaire.
                Laissez vide pour utiliser les valeurs par défaut.
              </p>
              {ALL_FIELDS.filter(({ key }) => !hiddenFields.includes(key)).map(({ key, label }) => (
                <div key={key} className="space-y-2 p-3 rounded-xl border border-border bg-secondary/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
                  <input
                    value={fieldLabels[key] ?? ""}
                    onChange={(e) => setFieldLabel(key, e.target.value)}
                    placeholder={`Label (ex: Numéro de set)`}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    value={fieldPhs[key] ?? ""}
                    onChange={(e) => setFieldPlaceholder(key, e.target.value)}
                    placeholder={`Exemple (ex: Technic, Icons, City…)`}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
            </div>
          )}
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

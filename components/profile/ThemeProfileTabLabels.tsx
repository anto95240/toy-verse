import React from "react";
import { ALL_FIELDS } from "./ThemeProfileFormModal";

const FIELD_EXAMPLES: Record<string, { label: string; example: string }> = {
  numero: { label: "Numéro de set", example: "75313" },
  nb_pieces: { label: "Nombre de pièces", example: "854" },
  subcategory: { label: "Gamme", example: "Technic, Icons, City…" },
  franchise: { label: "Univers", example: "Star Wars, Marvel…" },
  characters: { label: "Personnage", example: "Luke Skywalker" },
  studio: { label: "Fabricant", example: "Hasbro, Bandai…" },
  license: { label: "Licence", example: "Disney, Lucasfilm…" },
  taille: { label: "Échelle", example: "1/43, 18 cm…" },
  location: { label: "Lieu d'achat", example: "Disneyland, magasin…" },
};

interface ThemeProfileTabLabelsProps {
  hiddenFields: string[];
  fieldLabels: Record<string, string>;
  fieldPhs: Record<string, string>;
  setFieldLabel: (fieldKey: string, value: string) => void;
  setFieldPlaceholder: (fieldKey: string, value: string) => void;
}

export function ThemeProfileTabLabels({
  hiddenFields,
  fieldLabels,
  fieldPhs,
  setFieldLabel,
  setFieldPlaceholder,
}: ThemeProfileTabLabelsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Personnalisez les étiquettes et les exemples affichés dans le formulaire.
        Laissez vide pour utiliser les valeurs par défaut.
      </p>
      {ALL_FIELDS.filter(({ key }) => !hiddenFields.includes(key)).map(({ key, label }) => {
        const examples = FIELD_EXAMPLES[key] ?? { label: label, example: "" };
        return (
        <div key={key} className="space-y-2 p-3 rounded-xl border border-border bg-secondary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
          <input
            value={fieldLabels[key] ?? ""}
            onChange={(e) => setFieldLabel(key, e.target.value)}
            placeholder={`Libellé, ex. ${examples.label}`}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            value={fieldPhs[key] ?? ""}
            onChange={(e) => setFieldPlaceholder(key, e.target.value)}
            placeholder={examples.example ? `Exemple : ${examples.example}` : "Exemple affiché dans le champ"}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        );
      })}
    </div>
  );
}

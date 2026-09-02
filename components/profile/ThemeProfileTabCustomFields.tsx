import React from "react";
import type { ThemeProfileInput, CustomFieldDefinition, CustomFieldType } from "@/app/actions/themeProfiles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faGripVertical } from "@fortawesome/free-solid-svg-icons";

interface Props {
  form: ThemeProfileInput;
  setForm: React.Dispatch<React.SetStateAction<ThemeProfileInput>>;
}

export function ThemeProfileTabCustomFields({ form, setForm }: Props) {
  const customFields = form.custom_fields_definition || [];

  const addField = () => {
    const newField: CustomFieldDefinition = {
      id: `cf_${Math.random().toString(36).substring(2, 9)}`,
      label: "",
      type: "text",
    };
    setForm((prev) => ({
      ...prev,
      custom_fields_definition: [...(prev.custom_fields_definition || []), newField],
    }));
  };

  const updateField = (index: number, updates: Partial<CustomFieldDefinition>) => {
    setForm((prev) => {
      const next = [...(prev.custom_fields_definition || [])];
      next[index] = { ...next[index], ...updates };
      return { ...prev, custom_fields_definition: next };
    });
  };

  const removeField = (index: number) => {
    setForm((prev) => {
      const next = [...(prev.custom_fields_definition || [])];
      next.splice(index, 1);
      return { ...prev, custom_fields_definition: next };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Champs personnalisés dynamiques</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez de nouveaux champs spécifiques à ce type de jouet (ex: État de la boîte, Année de sortie).
          </p>
        </div>
        <button
          onClick={addField}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Ajouter
        </button>
      </div>

      <div className="space-y-4">
        {customFields.length === 0 ? (
          <div className="text-center py-8 bg-secondary/30 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">Aucun champ personnalisé pour le moment.</p>
          </div>
        ) : (
          customFields.map((field, idx) => (
            <div key={field.id} className="p-4 bg-secondary/30 border border-border rounded-xl flex gap-4 items-start">
              <div className="mt-2 text-muted-foreground/50 cursor-grab">
                <FontAwesomeIcon icon={faGripVertical} />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Nom du champ</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="Ex: État de la boîte"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Type de donnée</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(idx, { type: e.target.value as CustomFieldType })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="text">Texte court</option>
                    <option value="textarea">Texte long</option>
                    <option value="number">Nombre</option>
                    <option value="boolean">Case à cocher (Oui/Non)</option>
                    <option value="select">Liste déroulante</option>
                  </select>
                </div>
                
                {field.type === "select" && (
                  <div className="sm:col-span-2 space-y-1 mt-2">
                    <label className="text-xs font-semibold text-muted-foreground">Options (séparées par une virgule)</label>
                    <input
                      type="text"
                      value={field.options?.join(", ") || ""}
                      onChange={(e) => updateField(idx, { options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                      placeholder="Neuf, Très bon état, Occasion"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeField(idx)}
                className="mt-6 text-muted-foreground hover:text-destructive transition-colors p-2"
                title="Supprimer ce champ"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

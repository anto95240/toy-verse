import React from "react";
import { ALL_FIELDS } from "./ThemeProfileFormModal";

interface ThemeProfileTabFieldsProps {
  getFieldStatus: (key: string) => "hidden" | "primary" | "details" | "normal";
  toggleField: (fieldKey: string, list: "primary_fields" | "details_first_fields" | "hidden_fields") => void;
}

export function ThemeProfileTabFields({ getFieldStatus, toggleField }: ThemeProfileTabFieldsProps) {
  return (
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
  );
}

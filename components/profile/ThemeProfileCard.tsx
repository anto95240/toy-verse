"use client";

import React from "react";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

const FIELD_LABELS: Record<string, string> = {
  numero:     "Numéro",
  nb_pieces:  "Nb. pièces",
  subcategory:"Sous-catégorie",
  franchise:  "Franchise",
  characters: "Personnages",
  studio:     "Studio",
  license:    "Licence",
  taille:     "Taille",
  location:   "Lieu",
};

interface ThemeProfileCardProps {
  profile: ThemeProfileDB;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export default function ThemeProfileCard({ profile, onEdit, onDelete, isPending }: ThemeProfileCardProps) {
  const primaryFields = profile.primary_fields ?? [];
  const hiddenFields  = profile.hidden_fields ?? [];
  const allFields = Object.keys(FIELD_LABELS);
  const visibleFields = allFields.filter((f) => !hiddenFields.includes(f));

  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-all">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{profile.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base truncate">{profile.label}</h3>
          {profile.hint && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{profile.hint}</p>
          )}
        </div>
      </div>

      {/* Champs visibles */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Champs actifs</p>
        <div className="flex flex-wrap gap-1.5">
          {visibleFields.map((f) => (
            <span
              key={f}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                primaryFields.includes(f)
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {primaryFields.includes(f) ? "⭐ " : ""}{FIELD_LABELS[f] ?? f}
            </span>
          ))}
          {visibleFields.length === 0 && (
            <span className="text-xs text-muted-foreground italic">Aucun champ actif</span>
          )}
        </div>
      </div>

      {/* Champs masqués */}
      {hiddenFields.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Masqués</p>
          <div className="flex flex-wrap gap-1">
            {hiddenFields.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground line-through">
                {FIELD_LABELS[f] ?? f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-border mt-auto">
        <button
          onClick={onEdit}
          disabled={isPending}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={onDelete}
          disabled={isPending}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
}

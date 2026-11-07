"use client";

import React from "react";
import Link from "next/link";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

const FIELD_LABELS: Record<string, string> = {
  numero:      "Numéro",
  nb_pieces:   "Nb. pièces",
  subcategory: "Sous-catégorie",
  franchise:   "Franchise",
  characters:  "Personnages",
  studio:      "Studio",
  license:     "Licence",
  taille:      "Taille",
  location:    "Lieu",
};

interface ThemeProfileCardProps {
  profile: ThemeProfileDB;
  toyCount?: number;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export default function ThemeProfileCard({
  profile,
  toyCount,
  onEdit,
  onDelete,
  isPending,
}: ThemeProfileCardProps) {
  const primaryFields = profile.primary_fields ?? [];
  const hiddenFields  = profile.hidden_fields ?? [];
  const allFields     = Object.keys(FIELD_LABELS);
  const visibleFields = allFields.filter((f) => !hiddenFields.includes(f));

  return (
    <div className="relative flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all duration-200 group hover:shadow-md hover:border-primary/20">

      {/* Badge jouets */}
      {toyCount !== undefined && (
        <Link
          href={`/profile/type-toy/${profile.id}`}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
          title="Voir les jouets"
        >
          🧸 {toyCount}
        </Link>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-16">
        <span className="text-3xl shrink-0 mt-0.5">{profile.emoji}</span>
        <div className="flex-1 min-w-0">
          <Link
            href={`/profile/type-toy/${profile.id}`}
            className="font-bold text-foreground text-base truncate block hover:text-primary transition-colors"
          >
            {profile.label}
          </Link>
          {profile.hint && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{profile.hint}</p>
          )}
        </div>
      </div>

      {/* Champs actifs */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Champs actifs</p>
        <div className="flex flex-wrap gap-1.5">
          {visibleFields.map((f) => (
            <span
              key={f}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${
                primaryFields.includes(f)
                  ? "bg-primary/15 border-primary/35 text-primary"
                  : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {primaryFields.includes(f) && "⭐ "}{FIELD_LABELS[f] ?? f}
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Masqués</p>
          <div className="flex flex-wrap gap-1">
            {hiddenFields.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground/60 line-through">
                {FIELD_LABELS[f] ?? f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-3 border-t border-border">
        <Link
          href={`/profile/type-toy/${profile.id}`}
          className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-center transition-colors border border-primary/20"
        >
          👁 Voir les jouets
        </Link>
        <button
          onClick={onEdit}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

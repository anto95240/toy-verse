"use client";

/**
 * components/toys/PriorityFieldWrapper.tsx
 *
 * Wrapper pour un champ prioritaire (remonté en section principale selon le thème).
 * Affiche un indicateur visuel orange si le champ est vide et non ignoré,
 * et un toggle "Je ne connais pas cette info" pour masquer l'avertissement.
 */

import React from "react";
import type { FieldKey } from "@/lib/themeProfile";

// =============================================================================
// Labels par défaut pour les messages du toggle
// =============================================================================

const SKIP_LABELS: Record<FieldKey, string> = {
  numero:      "Je ne connais pas le numéro",
  nb_pieces:   "Je ne connais pas le nombre de pièces",
  subcategory: "Je ne connais pas la sous-catégorie",
  franchise:   "Je ne connais pas la franchise",
  characters:  "Je ne connais pas le(s) personnage(s)",
  studio:      "Je ne connais pas le studio",
  license:     "Je ne connais pas la licence",
  taille:      "Je ne connais pas la taille",
  location:    "Je ne connais pas le lieu d'achat",
};

// =============================================================================
// Props
// =============================================================================

interface PriorityFieldWrapperProps {
  fieldKey: FieldKey;
  /** Le champ est-il vide (pas de valeur renseignée) ? */
  isEmpty: boolean;
  /** L'utilisateur a-t-il coché "Je n'ai pas cette info" ? */
  isSkipped: boolean;
  /** Callback appelé quand l'utilisateur bascule le toggle */
  onToggleSkip: () => void;
  children: React.ReactNode;
  /** Si true, en mode édition (valeur déjà existante en BDD) → on n'affiche pas le toggle */
  isEditMode?: boolean;
}

// =============================================================================
// Composant
// =============================================================================

export default function PriorityFieldWrapper({
  fieldKey,
  isEmpty,
  isSkipped,
  onToggleSkip,
  children,
  isEditMode = false,
}: PriorityFieldWrapperProps) {
  const showWarning = isEmpty && !isSkipped && !isEditMode;
  const showToggle  = isEmpty && !isEditMode;

  return (
    <div className="relative">
      {/* Champ enfant (FormInput, SmartSelect, etc.) */}
      <div
        className={`transition-all duration-200 ${
          showWarning
            ? "ring-1 ring-amber-400/60 rounded-lg"
            : ""
        }`}
      >
        {children}
      </div>

      {/* Indicateur "info manquante" + toggle skip */}
      {showToggle && (
        <div className="mt-1.5 flex items-center gap-1.5">
          {showWarning && (
            <span className="text-amber-400 text-xs">⚠</span>
          )}
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isSkipped}
              onChange={onToggleSkip}
              className="w-3 h-3 rounded accent-amber-400 cursor-pointer"
            />
            <span
              className={`text-xs transition-colors ${
                isSkipped
                  ? "text-gray-500"
                  : "text-amber-400/80 group-hover:text-amber-300"
              }`}
            >
              {SKIP_LABELS[fieldKey]}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

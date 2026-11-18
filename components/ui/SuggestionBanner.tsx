"use client";

/**
 * components/ui/SuggestionBanner.tsx
 *
 * Bandeau de suggestions intelligentes affiché dans le formulaire.
 * Apparaît quand une entité sélectionnée permet de déduire d'autres entités.
 *
 * Ex: Woody sélectionné → "Franchise Toy Story détectée · Studio Pixar détecté"
 *
 * IMPORTANT : Location n'est jamais inclus dans ces suggestions (§11 CdC).
 * L'utilisateur peut accepter ou rejeter chaque suggestion individuellement.
 */

import React from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import type { SmartSelectItem } from "./SmartSelect";

export type Suggestion = {
  entityType: ReferentialEntityKey;
  item: SmartSelectItem;
  confidence: number;
  reason?: string;
  source?: "ai";
};

interface SuggestionBannerProps {
  suggestions: Suggestion[];
  /** Appelé quand l'utilisateur accepte une suggestion */
  onAccept: (suggestion: Suggestion) => void;
  /** Appelé quand l'utilisateur rejette une suggestion */
  onReject: (suggestion: Suggestion) => void;
  /** Appelé quand l'utilisateur accepte TOUTES les suggestions */
  onAcceptAll: () => void;
}

const entityLabels: Record<ReferentialEntityKey, string> = {
  category: "Catégorie",
  studio: "Studio",
  license: "Licence",
  franchise: "Franchise",
  character: "Personnage",
  location: "Lieu",
};

const entityColors: Record<ReferentialEntityKey, string> = {
  category: "text-blue-300",
  studio: "text-green-300",
  license: "text-purple-300",
  franchise: "text-amber-300",
  character: "text-pink-300",
  location: "text-teal-300",
};

export default function SuggestionBanner({
  suggestions,
  onAccept,
  onReject,
  onAcceptAll,
}: SuggestionBannerProps) {
  if (suggestions.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-amber-400/30 bg-amber-500/10 backdrop-blur-sm p-3 space-y-2"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-sm">
            {suggestions.some(s => s.source === "ai") ? "🤖" : "💡"}
          </span>
          <span className="text-amber-300 text-sm font-medium">
            {suggestions.some(s => s.source === "ai") ? "Détections par l'Intelligence Artificielle" : "Informations associées détectées"}
          </span>
        </div>
        {suggestions.length > 1 && (
          <button
            type="button"
            onClick={onAcceptAll}
            className="text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-300/50 px-2 py-0.5 rounded transition-all"
          >
            Tout appliquer
          </button>
        )}
      </div>

      {/* Liste des suggestions */}
      <ul className="space-y-1.5">
        {suggestions.map((suggestion) => (
          <li
            key={`${suggestion.entityType}-${suggestion.item.id}`}
            className="flex items-center gap-2 text-sm"
          >
            {/* Label type + nom */}
            <span className={`shrink-0 font-medium ${entityColors[suggestion.entityType]}`}>
              {entityLabels[suggestion.entityType]} :
            </span>
            {suggestion.source === "ai" && (
              <span title="Suggestion IA" className="shrink-0 text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                🤖 IA
              </span>
            )}
            <span className="text-white font-medium flex-1 line-clamp-2" title={suggestion.item.name}>
              {suggestion.item.name}
            </span>

            {/* Niveau de confiance */}
            <span
              className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                suggestion.confidence >= 90
                  ? "bg-green-500/20 text-green-400"
                  : suggestion.confidence >= 70
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}
              title={suggestion.reason}
            >
              {suggestion.confidence}%
            </span>

            {/* Actions */}
            <button
              type="button"
              onClick={() => onAccept(suggestion)}
              aria-label={`Accepter ${entityLabels[suggestion.entityType]} ${suggestion.item.name}`}
              className="shrink-0 text-xs bg-green-600/30 hover:bg-green-600/50 border border-green-400/30 hover:border-green-400/60 text-green-300 px-2 py-0.5 rounded transition-all"
            >
              ✓ Appliquer
            </button>
            <button
              type="button"
              onClick={() => onReject(suggestion)}
              aria-label={`Rejeter ${entityLabels[suggestion.entityType]} ${suggestion.item.name}`}
              className="shrink-0 text-xs bg-red-600/20 hover:bg-red-600/40 border border-red-400/20 hover:border-red-400/40 text-red-400 px-2 py-0.5 rounded transition-all"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-gray-500">
        Ces suggestions ne s&apos;appliquent que si vous cliquez &quot;Appliquer&quot;. Vous pouvez les corriger à tout moment.
      </p>
    </div>
  );
}

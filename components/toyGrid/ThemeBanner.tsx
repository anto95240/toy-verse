import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import type { ThemeBannerProps } from "@/types/toyGrid";

export default function ThemeBanner({
  isFromDifferentTheme,
  themeName,
  onClearSearch,
}: ThemeBannerProps) {
  if (!isFromDifferentTheme || !themeName) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div>
            <p className="font-medium text-blue-900">
              Jouet du thème &quot;{themeName}&quot;
            </p>
            <p className="text-sm text-blue-700">
              Vous visualisez un jouet spécifique. Réinitialisez les filtres
              pour voir tous les jouets du thème actuel.
            </p>
          </div>
        </div>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Voir tous les jouets
          </button>
        )}
      </div>
    </div>
  );
}

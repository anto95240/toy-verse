import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { createSlug } from "@/utils/slugUtils";
import ToyImage from "./ToyImage";
import {
  NumberBadge,
  ToyCategories,
  ToySpecs,
  ToyTags,
} from "./ToyCardSubComponents";
import type { ToyCardProps } from "@/types/toyGrid";

/**
 * Mobile-optimized ToyCard layout
 * Responsive design for small screens
 */
export function ToyCardMobile({
  toy,
  toyImageUrls,
  currentUserId,
  onEditToy,
  onDeleteToy,
  isFromDifferentTheme = false,
}: ToyCardProps) {
  const goToTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toy.theme_name)
      window.location.href = `/${createSlug(toy.theme_name)}?selectedToyId=${toy.id}`;
  };

  return (
    <div className="flex flex-col modern-card rounded-2xl overflow-hidden relative bg-card border border-border/60 hover-lift hover:border-primary/50 shadow-md hover:shadow-lg transition-all duration-300">
      {toy.numero && <NumberBadge n={toy.numero} />}

      {/* Image section */}
      <div className="flex justify-center p-2 sm:p-3 bg-gradient-to-br from-secondary to-muted/50 relative z-10 group-hover:from-muted group-hover:to-secondary/50 transition-all duration-300">
        <ToyImage
          toy={toy}
          toyImageUrls={toyImageUrls}
          currentUserId={currentUserId}
        />
      </div>

      {/* Content section */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start mb-2.5 gap-2 min-w-0 overflow-hidden">
          <h3 className="font-title font-bold text-foreground text-base sm:text-lg leading-tight line-clamp-2 flex-1 min-w-0">
            {toy.nom}
          </h3>
          <div className="flex gap-1 shrink-0 flex-none">
            <button
              aria-label="modification d'un jouet"
              onClick={(e) => {
                e.stopPropagation();
                onEditToy(toy);
              }}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500/40 hover:text-green-700 transition-all duration-200 text-xs"
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
            <button
              aria-label="suppression d'un jouet"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteToy(toy.id);
              }}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/40 hover:text-destructive/90 transition-all duration-200 text-xs"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </div>
        </div>

        <ToyCategories toy={toy} />
        <div className="flex-1 mt-1.5">
          <ToySpecs toy={toy} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 gap-2 text-xs">
          <ToyTags toy={toy} />
          {isFromDifferentTheme && toy.theme_name && (
            <button
              onClick={goToTheme}
              className="font-semibold text-primary hover:text-primary/80 whitespace-nowrap hover:translate-x-1 transition-all duration-200"
            >
              {toy.theme_name} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

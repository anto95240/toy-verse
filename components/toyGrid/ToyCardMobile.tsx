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
    <div className="flex flex-col modern-card rounded-2xl overflow-hidden floating-animation relative bg-card">
      {toy.numero && <NumberBadge n={toy.numero} />}

      {/* Image section */}
      <div className="flex justify-center p-4 bg-muted/30 relative z-10">
        <ToyImage
          toy={toy}
          toyImageUrls={toyImageUrls}
          currentUserId={currentUserId}
        />
      </div>

      {/* Content section */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2">
            {toy.nom}
          </h3>
          <div className="flex gap-1 shrink-0">
            <button
              aria-label="modification d'un jouet"
              onClick={(e) => {
                e.stopPropagation();
                onEditToy(toy);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20"
            >
              <FontAwesomeIcon icon={faPen} className="text-xs" />
            </button>
            <button
              aria-label="suppression d'un jouet"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteToy(toy.id);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
            </button>
          </div>
        </div>

        <ToyCategories toy={toy} />
        <ToySpecs toy={toy} />

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <ToyTags toy={toy} />
          {isFromDifferentTheme && toy.theme_name && (
            <button
              onClick={goToTheme}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {toy.theme_name} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

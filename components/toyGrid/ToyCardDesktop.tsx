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
 * Desktop-optimized ToyCard layout
 * Horizontal layout with image on left, content on right
 */
export function ToyCardDesktop({
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
    <div className="modern-card rounded-2xl overflow-hidden min-h-52 lg:min-h-56 xl:h-64 floating-animation bg-card border border-border hover:shadow-lg transition-all group flex flex-col lg:flex-row">
      {/* Image section - Left side */}
      <div className="w-full lg:w-40 xl:w-48 bg-muted/30 flex flex-col items-center justify-between p-2 sm:p-3 lg:p-4 relative group-hover:bg-muted/50 transition-colors z-10">
        {toy.numero && <NumberBadge n={toy.numero} />}

        <div className="w-full flex-1 flex items-center justify-center">
          <ToyImage
            toy={toy}
            toyImageUrls={toyImageUrls}
            currentUserId={currentUserId}
          />
        </div>

        {/* Action buttons - Show on hover */}
        <div className="flex gap-3 mt-3 lg:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            aria-label="modification d'un jouet"
            onClick={(e) => {
              e.stopPropagation();
              onEditToy(toy);
            }}
            className="text-muted-foreground hover:text-green-600"
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            aria-label="suppression d'un jouet"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteToy(toy.id);
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {/* Content section - Right side */}
      <div className="flex-1 p-2.5 sm:p-3 lg:p-3.5 xl:p-5 flex flex-col min-w-0">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2 lg:mb-2.5 gap-1.5 min-w-0">
          <h3 className="font-bold text-base sm:text-lg lg:text-lg xl:text-xl text-foreground line-clamp-2 break-words">{toy.nom}</h3>
          <div className="shrink-0">
            <ToyTags toy={toy} />
          </div>
        </div>

        <ToyCategories toy={toy} />

        <div className="flex flex-col gap-2 lg:gap-2.5 xl:gap-3 flex-1">
          <ToySpecs toy={toy} />
        </div>

        {isFromDifferentTheme && toy.theme_name && (
          <button
            onClick={goToTheme}
            className="self-end text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 mt-auto"
          >
            Voir le thème {toy.theme_name} <span className="text-xs">↗</span>
          </button>
        )}
      </div>
    </div>
  );
}

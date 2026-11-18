import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { createSlug } from "@/utils/slugUtils";
import { getThemeProfile } from "@/lib/themeProfile";
import ToyImage from "./ToyImage";
import {
  NumberBadge,
  ToyCategories,
  ToySpecs,
  ToyTags,
} from "./ToyCardSubComponents";
import type { ToyCardProps } from "@/types/toyGrid";

function EditButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      aria-label="modification d'un jouet"
      onClick={onClick}
      className="inline-flex items-center justify-center w-8 h-8 sm:w-8 sm:h-8 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500/40 hover:text-green-700 transition-colors duration-200 text-xs"
    >
      <FontAwesomeIcon icon={faPen} />
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      aria-label="suppression d'un jouet"
      onClick={onClick}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/40 transition-colors duration-200 text-xs"
    >
      <FontAwesomeIcon icon={faTrash} />
    </button>
  );
}

/**
 * Une seule carte, une seule photo. Le détail mobile / bureau
 * se fait en CSS pour ne pas monter deux images par jouet.
 */
export default function ToyCard({
  toy,
  toyImageUrls,
  currentUserId,
  onEditToy,
  onDeleteToy,
  onViewDetails,
  isFromDifferentTheme = false,
  themeName: themeNameProp,
}: ToyCardProps) {
  const themeName = toy.theme_name || themeNameProp;
  const profile = useMemo(() => getThemeProfile(themeName || ""), [themeName]);
  const showNumeroBadge =
    !!toy.numero && !profile.hiddenFields.includes("numero");

  const edit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditToy(toy);
  };
  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteToy(toy.id);
  };
  const goToTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toy.theme_name)
      window.location.href = `/${createSlug(toy.theme_name)}?selectedToyId=${toy.id}`;
  };

  return (
    <li className="group relative w-full hover:z-10 hover-lift [content-visibility:auto] [contain-intrinsic-size:auto_18rem]">
      <div
        className="modern-card h-full rounded-2xl overflow-hidden sm:min-h-52 lg:min-h-56 xl:h-64 bg-card border border-border/60 hover:translate-y-0 hover:border-primary/50 flex flex-col lg:flex-row shadow-md cursor-pointer"
        onClick={onViewDetails}
      >
        <div className="w-full lg:w-40 xl:w-48 bg-gradient-to-br from-secondary to-muted/50 flex flex-col items-center justify-between p-2 sm:p-3 lg:p-4 relative shrink-0">
          {showNumeroBadge && <NumberBadge n={toy.numero!} />}

          <div className="w-full flex items-center justify-center">
            <ToyImage
              toy={toy}
              toyImageUrls={toyImageUrls}
              currentUserId={currentUserId}
            />
          </div>

          <div className="hidden sm:flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-wrap justify-center">
            <EditButton onClick={edit} />
            <DeleteButton onClick={remove} />
          </div>
        </div>

        <div className="flex-1 p-2.5 sm:p-3 lg:p-3.5 xl:p-5 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-1.5 sm:mb-2 gap-1.5 min-w-0">
            <h3 className="font-title font-bold text-base sm:text-lg xl:text-xl text-foreground line-clamp-2 break-words">
              {toy.nom}
            </h3>
            <div className="hidden sm:block shrink-0">
              <ToyTags toy={toy} />
            </div>
            <div className="flex sm:hidden gap-1.5 shrink-0">
              <EditButton onClick={edit} />
              <DeleteButton onClick={remove} />
            </div>
          </div>

          <ToyCategories toy={toy} themeName={themeName} />

          <div className="flex flex-col gap-2 flex-1 mt-1.5">
            <ToySpecs toy={toy} themeName={themeName} hideNumero={showNumeroBadge} />
          </div>

          <div className="flex sm:hidden items-center justify-between mt-3 pt-2 border-t border-border/50 gap-2 text-xs">
            <ToyTags toy={toy} />
            {isFromDifferentTheme && toy.theme_name && (
              <button
                onClick={goToTheme}
                className="font-semibold text-primary whitespace-nowrap"
              >
                {toy.theme_name} →
              </button>
            )}
          </div>

          {isFromDifferentTheme && toy.theme_name && (
            <button
              onClick={goToTheme}
              className="hidden sm:flex self-end text-sm font-semibold text-primary items-center gap-1 mt-auto"
            >
              Voir le thème {toy.theme_name} <span className="text-xs">↗</span>
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faTrash,
  faPuzzlePiece,
  faRulerVertical,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { Toy } from "@/types/theme";

/**
 * Sub-components for ToyCard
 * Extracted for reusability and cleaner structure
 */

interface InfoBadgeProps {
  icon: IconDefinition;
  text: string | number;
  color: string;
  multiline?: boolean;
}

export const NumberBadge = ({ n }: { n: string }) => (
  <div className="absolute top-3 left-3 z-30 bg-foreground text-background px-3 py-1.5 rounded-lg shadow-md font-title font-bold text-sm border border-background/20 backdrop-blur-sm hover:shadow-lg transition-shadow duration-200">
    #{n}
  </div>
);

export const InfoBadge = ({ icon, text, color, multiline = false }: InfoBadgeProps) => (
  <div className={`flex items-center gap-2 text-xs lg:text-sm font-medium text-muted-foreground bg-secondary/60 border border-border/50 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-lg hover:bg-secondary/80 transition-colors duration-200 min-w-0 ${multiline ? 'items-start' : ''}`} title={String(text)}>
    <FontAwesomeIcon icon={icon} className={`${color} shrink-0 ${multiline ? 'mt-0.5' : ''}`} />
    <span className={multiline ? "line-clamp-2 break-words" : "truncate"}>{text}</span>
  </div>
);

export const ToyCategories = ({
  toy,
}: {
  toy: { studio?: string | null; categorie?: string | null };
}) => (
  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
    {toy.studio && (
      <span className="text-xs sm:text-sm font-semibold text-primary/80 uppercase tracking-wide">
        {toy.studio}
      </span>
    )}
    {toy.categorie && (
      <span className="text-xs sm:text-sm text-muted-foreground/80">
        • {toy.categorie}
      </span>
    )}
  </div>
);

export const ToyTags = ({
  toy,
}: {
  toy: { is_exposed?: boolean | null; is_soon?: boolean | null };
}) => (
  <div className="flex gap-2">
    {toy.is_exposed && (
      <span
        className="text-[10px] uppercase font-bold bg-green-500/15 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full border border-green-500/20 sm:w-2.5 sm:h-2.5 sm:p-0 sm:bg-green-500 sm:border-0"
        title="Exposé"
      >
        <span className="sm:hidden">Exposé</span>
      </span>
    )}
    {toy.is_soon && (
      <span
        className="text-[10px] uppercase font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 sm:w-2.5 sm:h-2.5 sm:p-0 sm:bg-purple-500 sm:border-0"
        title="Wishlist"
      >
        <span className="sm:hidden">Wishlist</span>
      </span>
    )}
  </div>
);

export const ToySpecs = ({
  toy,
}: {
  toy: {
    nb_pieces?: number | string | null;
    release_date?: string | number | null;
    taille?: string | number | null;
  };
}) => (
  <div className="space-y-2.5 lg:space-y-3">
    {/* Pièces et Année côte à côte même sur mobile */}
    <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 lg:gap-3">
      {toy.nb_pieces && (
        <InfoBadge
          icon={faPuzzlePiece}
          text={`${toy.nb_pieces} p.`}
          color="text-primary"
        />
      )}
      {toy.release_date && (
        <InfoBadge
          icon={faCalendarAlt}
          text={toy.release_date}
          color="text-orange-500"
        />
      )}
    </div>
    {/* Taille pleine largeur avec support multi-ligne */}
    {toy.taille && (
      <InfoBadge
        icon={faRulerVertical}
        text={toy.taille}
        color="text-purple-500"
        multiline={true}
      />
    )}
  </div>
);

export const ToyActionButtons = ({
  onEdit,
  onDelete,
  className = "",
}: {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}) => (
  <div className={`flex gap-1 shrink-0 ${className}`}>
    <button
      aria-label="modification d'un jouet"
      onClick={onEdit}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20"
    >
      <FontAwesomeIcon icon={faPen} className="text-xs" />
    </button>
    <button
      aria-label="suppression d'un jouet"
      onClick={onDelete}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
    >
      <FontAwesomeIcon icon={faTrash} className="text-xs" />
    </button>
  </div>
);

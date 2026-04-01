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
}

export const NumberBadge = ({ n }: { n: string }) => (
  <div className="absolute top-2 left-2 z-30 bg-foreground text-background px-2.5 py-1 rounded-lg shadow-md font-bold text-xs border border-background/20 backdrop-blur-sm">
    #{n}
  </div>
);

export const InfoBadge = ({ icon, text, color }: InfoBadgeProps) => (
  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border">
    <FontAwesomeIcon icon={icon} className={color} />
    <span>{text}</span>
  </div>
);

export const ToyCategories = ({
  toy,
}: {
  toy: { studio?: string | null; categorie?: string | null };
}) => (
  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
    {toy.studio && (
      <span className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase">
        {toy.studio}
      </span>
    )}
    {toy.categorie && (
      <span className="text-xs sm:text-sm text-muted-foreground/70">
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
        className="text-[10px] uppercase font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full sm:w-2 sm:h-2 sm:p-0 sm:bg-green-500"
        title="Exposé"
      >
        <span className="sm:hidden">Exposé</span>
      </span>
    )}
    {toy.is_soon && (
      <span
        className="text-[10px] uppercase font-bold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full sm:w-2 sm:h-2 sm:p-0 sm:bg-purple-500"
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
  <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2 sm:gap-y-2 sm:gap-x-4">
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
    {toy.taille && (
      <InfoBadge
        icon={faRulerVertical}
        text={toy.taille}
        color="text-purple-500"
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

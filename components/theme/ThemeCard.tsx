import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { Theme } from "@/types/theme";

interface ThemeCardProps {
  theme: Theme;
  imageUrl: string | null;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ThemeCard = ({
  theme,
  imageUrl,
  onClick,
  onEdit,
  onDelete,
}: ThemeCardProps) => (
  <li className="modern-card rounded-2xl cursor-pointer p-4 sm:p-6 flex flex-col items-center hover-lift w-full max-w-sm group shadow-elevation-2 hover:shadow-elevation-3 transition-all border-border/60">
    {/* Image container */}
    <div
      className="relative cursor-pointer w-full h-32 sm:h-40 overflow-hidden rounded-lg mb-4 group-hover:brightness-110 transition-all duration-300"
      onClick={onClick}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={theme.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-secondary border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
          <span className="text-sm font-medium">Aucune image</span>
        </div>
      )}
    </div>

    {/* Content section */}
    <div className="flex flex-1 items-center justify-between w-full gap-2">
      <h3 className="font-title font-semibold text-base sm:text-lg truncate flex-1 text-foreground line-clamp-2">
        {theme.name}
      </h3>
      <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={onEdit}
          className="icon-btn bg-green-500/20 text-green-600 hover:bg-green-500/40"
          aria-label="Modifier"
        >
          <FontAwesomeIcon icon={faPen} className="text-sm" />
        </button>
        <button
          onClick={onDelete}
          className="icon-btn bg-destructive/20 text-destructive hover:bg-destructive/40"
          aria-label="Supprimer"
        >
          <FontAwesomeIcon icon={faTrash} className="text-sm" />
        </button>
      </div>
    </div>
  </li>
);
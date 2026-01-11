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
import { useRouter } from "next/navigation";
import { createSlug } from "@/utils/slugUtils";
import ToyImage from "./ToyImage";
import type { ToyCardProps } from "@/types/toyGrid";

interface InfoBadgeProps {
  icon: IconDefinition;
  text: string | number;
  color: string;
}

const NumberBadge = ({ n }: { n: string }) => (
  <div className="absolute top-2 left-2 z-30 bg-foreground text-background px-2.5 py-1 rounded-lg shadow-md font-bold text-xs border border-background/20 backdrop-blur-sm">
    #{n}
  </div>
);
const InfoBadge = ({ icon, text, color }: InfoBadgeProps) => (
  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md border border-border">
    <FontAwesomeIcon icon={icon} className={color} />
    <span>{text}</span>
  </div>
);

export default function ToyCard({
  toy,
  toyImageUrls,
  currentUserId,
  onEditToy,
  onDeleteToy,
  isFromDifferentTheme = false,
}: ToyCardProps) {
  const router = useRouter();
  const goToTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toy.theme_name) router.push(`/${createSlug(toy.theme_name)}`);
  };

  const Actions = () => (
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
  );

  return (
    <li className="w-full group">
      {/* MOBILE VIEW */}
      <div className="flex flex-col sm:hidden modern-card rounded-2xl overflow-hidden floating-animation relative bg-card">
        {toy.numero && <NumberBadge n={toy.numero} />}
        <div className="flex justify-center p-4 bg-muted/30 relative z-10">
          <ToyImage
            toy={toy}
            toyImageUrls={toyImageUrls}
            currentUserId={currentUserId}
          />
        </div>
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-3 gap-2">
            <h3 className="font-bold text-foreground text-lg leading-tight line-clamp-2">
              {toy.nom}
            </h3>
            <Actions />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {toy.nb_pieces && (
              <InfoBadge
                icon={faPuzzlePiece}
                text={toy.nb_pieces}
                color="text-primary"
              />
            )}
            {toy.taille && (
              <InfoBadge
                icon={faRulerVertical}
                text={toy.taille}
                color="text-purple-500"
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
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div className="flex gap-2">
              {toy.is_exposed && (
                <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                  Exposé
                </span>
              )}
              {toy.is_soon && (
                <span className="text-[10px] uppercase font-bold bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full">
                  Wishlist
                </span>
              )}
            </div>
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

      {/* DESKTOP VIEW */}
      <div className="hidden sm:flex modern-card rounded-2xl overflow-hidden h-64 floating-animation bg-card border border-border hover:shadow-lg transition-all">
        <div className="w-48 bg-muted/30 flex flex-col items-center justify-between p-4 relative group-hover:bg-muted/50 transition-colors z-10">
          {toy.numero && <NumberBadge n={toy.numero} />}
          <div className="w-full flex-1 flex items-center justify-center">
            <ToyImage
              toy={toy}
              toyImageUrls={toyImageUrls}
              currentUserId={currentUserId}
            />
          </div>
          <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-xl text-foreground mb-1">
              {toy.nom}
            </h3>
            <div className="flex gap-2">
              {toy.is_exposed && (
                <span
                  className="w-2 h-2 rounded-full bg-green-500"
                  title="Exposé"
                />
              )}
              {toy.is_soon && (
                <span
                  className="w-2 h-2 rounded-full bg-purple-500"
                  title="Wishlist"
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {toy.studio && (
              <span className="text-sm font-semibold text-muted-foreground uppercase">
                {toy.studio}
              </span>
            )}
            {toy.categorie && (
              <span className="text-sm text-muted-foreground/70">
                • {toy.categorie}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {toy.nb_pieces && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FontAwesomeIcon
                    icon={faPuzzlePiece}
                    className="text-primary w-4"
                  />
                  <span>{toy.nb_pieces} p.</span>
                </div>
              )}
              {toy.release_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-orange-500 w-4"
                  />
                  <span>{toy.release_date}</span>
                </div>
              )}
            </div>
            {toy.taille && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FontAwesomeIcon
                  icon={faRulerVertical}
                  className="text-purple-500 w-4"
                />
                <span>{toy.taille}</span>
              </div>
            )}
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
    </li>
  );
}

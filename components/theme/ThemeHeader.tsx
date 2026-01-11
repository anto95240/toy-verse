"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faLayerGroup,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

interface ThemeHeaderProps {
  themeName: string;
  filteredToysCount: number;
  totalToysCount: number;
  showMobileFilters: boolean;
  onToggleMobileFilters: () => void;
  view: "collection" | "wishlist";
  onViewChange: (view: "collection" | "wishlist") => void;
  children?: React.ReactNode;
}

export default function ThemeHeader({
  themeName,
  filteredToysCount,
  totalToysCount,
  showMobileFilters,
  onToggleMobileFilters,
  view,
  onViewChange,
  children,
}: ThemeHeaderProps) {
  return (
    <div className="top-16 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-4 mb-6 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {themeName}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {filteredToysCount} / {totalToysCount}
            </span>
          </div>

          <div className="flex p-1 bg-secondary/50 rounded-xl border border-border/50 self-start md:self-auto">
            <button
              onClick={() => onViewChange("collection")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                view === "collection"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              Collection
            </button>
            <button
              onClick={() => onViewChange("wishlist")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                view === "wishlist"
                  ? "bg-background text-pink-500 shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-pink-500 hover:bg-background/50"
              }`}
            >
              <FontAwesomeIcon icon={faHeart} />
              Wishlist
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <button
            onClick={onToggleMobileFilters}
            className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/80 hover:bg-secondary text-secondary-foreground rounded-xl text-sm font-bold transition-colors border border-border/50"
          >
            <FontAwesomeIcon icon={faFilter} />
            {showMobileFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </button>

          <div className="w-full sm:w-auto flex flex-wrap items-center gap-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

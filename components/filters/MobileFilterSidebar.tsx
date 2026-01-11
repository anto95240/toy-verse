import React, { useEffect } from "react";
import FilterContent from "./FilterContent";
import type { FilterSidebarProps } from "@/types/filters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

interface MobileFilterSidebarProps
  extends Omit<FilterSidebarProps, "className" | "isMobile"> {
  onClose: () => void;
}

export default function MobileFilterSidebar({
  onClose,
  filterCounts,
  ...props
}: MobileFilterSidebarProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed top-0 right-0 h-full w-80 bg-background z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="font-bold text-lg">Filtres</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Fermer"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <FilterContent
            {...props}
            filterCounts={filterCounts}
            isMobile={true}
            onClose={onClose}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faCheck} />
            Voir les {filterCounts.totalToys || 0} résultats
          </button>
        </div>
      </div>
    </>
  );
}

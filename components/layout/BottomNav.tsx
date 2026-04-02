"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faUser,
  faPlus,
  faLayerGroup,
  faTimes,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import SearchOverlay from "@/components/search/SearchOverlay";
import { createSlug } from "@/utils/slugUtils";
import { useBottomNav } from "@/hooks/ui/useBottomNav";
import NavButton from "@/components/ui/NavButton";
import { useFab } from "@/context/FabContext";

export default function BottomNav() {
  const { triggerAction } = useFab();
  const {
    isSearchOpen,
    setIsSearchOpen,
    isThemesOpen,
    setIsThemesOpen,
    themes,
    isActive,
  } = useBottomNav();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden z-30 flex items-center justify-around pb-safe shadow-elevation-4">
        <NavButton
          href="/home"
          icon={faHome}
          label="Accueil"
          isActive={isActive("/home")}
        />
        <NavButton
          onClick={() => setIsThemesOpen(true)}
          icon={faLayerGroup}
          label="Thèmes"
          isActive={isThemesOpen}
        />
        <div className="relative -top-6">
          <button
            onClick={triggerAction}
            className="flex items-center justify-center w-14 h-14 bg-gradient-brand rounded-full text-white shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 active:scale-95 active:translate-y-0"
            aria-label="Ajouter"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xl" />
          </button>
        </div>

        <NavButton
          onClick={() => setIsSearchOpen(true)}
          icon={faSearch}
          label="Recherche"
        />
        <NavButton
          href="/profile"
          icon={faUser}
          label="Profil"
          isActive={isActive("/profile")}
        />
      </div>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {isThemesOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsThemesOpen(false)}
          />
          <div className="bg-background rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto relative animate-slide-in shadow-elevation-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border/50">
              <h3 className="font-title font-bold text-2xl text-gradient">Vos Thèmes</h3>
              <button
                onClick={() => setIsThemesOpen(false)}
                aria-label="ferme la popup"
                className="icon-btn w-8 h-8"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="space-y-2 pb-safe">
              {themes.length > 0 ? (
                themes.map((t) => (
                  <Link
                    key={t.id}
                    href={`/${createSlug(t.name)}`}
                    onClick={() => setIsThemesOpen(false)}
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary hover:bg-primary/5 active:bg-primary/10 transition-all duration-200 hover-lift"
                  >
                    <span className="font-medium text-foreground">{t.name}</span>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-xs text-muted-foreground"
                    />
                  </Link>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Chargement...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

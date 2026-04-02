"use client";

import Link from "next/link";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUser,
  faChevronDown,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import ThemeToggle from "@/components/common/ThemeToggle";
import SearchBar from "../search/SearchBar";
import { createSlug } from "@/utils/slugUtils";
import { useNavbarLogic } from "@/hooks/ui/useNavbarLogic";
import type { Toy } from "@/types/theme";

interface NavbarProps {
  prenom?: string;
  onSearchResults?: (results: (Toy & { theme_name: string })[]) => void;
  isGlobal?: boolean;
}

export default function Navbar({
  prenom,
  onSearchResults,
  isGlobal = false,
}: NavbarProps) {
  const {
    themes,
    isDropdownOpen,
    setIsDropdownOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isMobileThemesOpen,
    setIsMobileThemesOpen,
    handleLogout,
    dropdownRef,
  } = useNavbarLogic();

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-lg border-b border-border/50 transition-all duration-300 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hidden md:block lg:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors duration-200"
              aria-label="Menu"
            >
              <FontAwesomeIcon
                icon={isMobileMenuOpen ? faTimes : faBars}
                className="text-lg"
              />
            </button>
            <Link
              href="/home"
              className="font-title text-2xl font-bold bg-gradient-brand bg-clip-text text-transparent hover:opacity-80 transition-opacity duration-200"
            >
              ToyVerse
            </Link>

            <div className="hidden lg:flex items-center gap-6 ml-4">
              <Link
                href="/home"
                className="font-title text-lg text-foreground hover:text-primary transition-colors duration-200 relative group"
              >
                Accueil
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-200 focus:outline-none font-title text-lg relative group"
                >
                  Thèmes{" "}
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-xl shadow-black/10 py-2 animate-scale-in z-50">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/50 mb-2">
                      Vos Collections
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {themes.map((t) => (
                        <Link
                          key={t.id}
                          href={`/${createSlug(t.name)}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-foreground hover:bg-primary/15 hover:text-primary transition-all duration-200 border-l-2 border-transparent hover:border-primary hover:translate-x-1"
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isGlobal && (
            <div className="hidden md:block flex-1 max-w-xl mx-8">
              <SearchBar onResults={onSearchResults} />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {prenom && (
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors lg:border-l lg:pl-4 border-border h-6"
              >
                <div className="w-8 h-8 lg:w-7 lg:h-7 rounded-full bg-secondary flex items-center justify-center text-primary border border-border">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-sm lg:text-xs"
                  />
                </div>
                <span className="hidden lg:inline">{prenom}</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              aria-label="deconnexion"
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 top-16 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="lg:hidden absolute top-16 left-0 w-full bg-background border-t border-border z-50 shadow-xl p-3 space-y-2">
            <Link
              href="/home"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
            >
              <span className="font-semibold text-sm">Accueil</span>
            </Link>
            <button
              onClick={() => setIsMobileThemesOpen(!isMobileThemesOpen)}
              className={`w-full flex justify-between p-3 rounded-lg border transition-all ${
                isMobileThemesOpen
                  ? "bg-secondary/50 border-primary/30"
                  : "bg-card border-border"
              }`}
            >
              <span className="font-semibold text-sm">Thèmes</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-xs ${isMobileThemesOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all ${
                isMobileThemesOpen ? "max-h-[50vh] mt-2" : "max-h-0"
              }`}
            >
              <div className="space-y-1 pl-1">
                {themes.map((t) => (
                  <Link
                    key={t.id}
                    href={`/${createSlug(t.name)}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm font-medium hover:text-primary hover:bg-secondary/50 rounded-md border-l-2 border-transparent hover:border-primary ml-2"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

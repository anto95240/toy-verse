import React from "react";
import Navbar from "@/components/layout/Navbar";

export default function ThemeLoading() {
  return (
    <>
      <Navbar prenom="..." isGlobal={true} />

      {/* =========================================
          ZONE 1 : LA SIDEBAR (Cachée sur mobile)
      ========================================= */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-80 lg:w-96 border-r border-border bg-card p-6 flex-col gap-6 animate-pulse z-30">
        <div className="h-10 w-3/4 bg-secondary rounded-lg mb-4"></div>
        <div className="space-y-6">
          <div>
            <div className="h-6 w-1/2 bg-secondary rounded-md mb-3"></div>
            <div className="space-y-2">
              <div className="h-8 w-full bg-secondary/50 rounded-md"></div>
              <div className="h-8 w-full bg-secondary/50 rounded-md"></div>
              <div className="h-8 w-full bg-secondary/50 rounded-md"></div>
            </div>
          </div>
          <div className="pt-6 border-t border-border space-y-4">
             <div className="h-6 w-full bg-secondary/70 rounded-md"></div>
             <div className="h-6 w-full bg-secondary/70 rounded-md"></div>
          </div>
        </div>
      </aside>

      {/* =========================================
          ZONE 2 & 3 : LE CONTENU PRINCIPAL
      ========================================= */}
      <div className="min-h-[calc(100vh-64px)] relative bg-gradient-to-br from-bg-primary via-bg-primary to-bg-second">
        <main className="w-full lg:pl-96 transition-all duration-300 ease-in-out animate-pulse">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            
            {/* ZONE 2 : La Bannière (ThemeHeader) */}
            <div className="w-full h-48 md:h-64 bg-secondary shadow-md border border-border rounded-2xl p-4 md:p-6 mb-8 flex flex-col justify-end relative overflow-hidden">
              
              {/* Faux texte (Titre du thème) */}
              <div className="h-10 w-2/3 md:w-1/3 bg-background/50 rounded-lg"></div>
              
              {/* ✨ NOUVEAU : Faux bouton "Filtres" visible UNIQUEMENT sur mobile */}
              <div className="lg:hidden absolute bottom-4 right-4 h-10 w-28 bg-background/60 rounded-xl"></div>
              
            </div>
            
            {/* ZONE 3 : Barre de Tri et Grille */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
              <div className="h-10 w-full md:w-64 bg-secondary rounded-xl"></div>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="h-10 w-24 bg-secondary rounded-lg"></div>
                <div className="h-10 w-24 bg-secondary rounded-lg"></div>
              </div>
            </div>

            {/* ✨ NOUVEAU : Grille en 1 colonne sur mobile (grid-cols-1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 pb-20">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm h-72 sm:h-64">
                  {/* Fausse image */}
                  <div className="h-2/3 bg-secondary w-full"></div>
                  {/* Fausses infos */}
                  <div className="h-1/3 p-4 flex flex-col justify-center space-y-2">
                    <div className="h-4 w-3/4 bg-secondary/80 rounded-full"></div>
                    <div className="h-3 w-1/2 bg-secondary/40 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
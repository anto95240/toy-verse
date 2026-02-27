import React from "react";
import Navbar from "@/components/layout/Navbar";

export default function HomeLoading() {
  return (
    <>
      <Navbar prenom="..." isGlobal={true} />
      <div className="relative min-h-screen bg-gradient-to-br from-bg-primary via-bg-primary to-bg-second p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Faux Titre */}
          <div className="text-center mb-12 animate-pulse">
            <div className="h-12 w-64 bg-secondary rounded-xl mx-auto mb-4"></div>
            <div className="h-4 w-96 max-w-[80vw] bg-secondary/50 rounded-full mx-auto"></div>
          </div>

          {/* Fausse Grille de Thèmes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-card border border-border rounded-2xl w-full shadow-sm"></div>
            ))}
          </div>
          
        </div>
      </div>
    </>
  );
}
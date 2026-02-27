import React from "react";
import Navbar from "@/components/layout/Navbar";

export default function ProfileLoading() {
  return (
    <>
      <Navbar prenom="..." />
      
      <main className="max-w-6xl mx-auto p-4 md:p-8 pb-28 md:pb-12 space-y-8 animate-pulse">
        
        {/* Fausse Bannière (Header) */}
        <div className="bg-secondary rounded-3xl h-40 w-full shadow-xl"></div>

        {/* Fausses Statistiques */}
        <section>
          <div className="h-6 w-32 bg-secondary rounded-md mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-card border border-border rounded-xl w-full"></div>
            ))}
          </div>
        </section>

        {/* Faux Paramètres */}
        <section>
          <div className="h-6 w-32 bg-secondary rounded-md mb-4"></div>
          <div className="h-[400px] bg-card border border-border rounded-xl w-full"></div>
        </section>

      </main>
    </>
  );
}
"use client"; // On passe en client pour utiliser un useEffect

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // On attend 300ms avant d'afficher le Skeleton
    // Si la page charge avant 300ms, ce composant est détruit et le Skeleton n'est jamais vu !
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    // Pendant les 300 premières millisecondes, on n'affiche rien du tout (ou juste la Navbar)
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-primary to-bg-second">
        <Navbar prenom="..." isGlobal={true} />
      </div>
    );
  }

  // Si ça prend plus de 300ms, on affiche le joli Skeleton
  return (
    <>
      <Navbar prenom="..." isGlobal={true} />
      <div className="relative min-h-screen bg-gradient-to-br from-bg-primary via-bg-primary to-bg-second p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-pulse">
            <div className="h-12 w-64 bg-secondary rounded-xl mx-auto mb-4"></div>
            <div className="h-4 w-96 max-w-[80vw] bg-secondary/50 rounded-full mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-card border border-border rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
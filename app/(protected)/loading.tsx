import React from "react";
import Navbar from "@/components/layout/Navbar";

export default function GlobalLoading() {
  return (
    <>
      <Navbar prenom="..." isGlobal={true} />
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-primary to-bg-second flex flex-col items-center justify-center p-8">
        
        {/* Spinner moderne et élégant */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="w-2 h-2 bg-primary rounded-full absolute animate-pulse"></div>
        </div>

        <p className="text-text-second text-lg animate-pulse font-medium">
          Chargement de votre univers...
        </p>

      </div>
    </>
  );
}
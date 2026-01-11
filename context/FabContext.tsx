"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// Le type de l'action (une simple fonction)
type FabAction = () => void;

interface FabContextType {
  registerAction: (action: FabAction) => void;
  triggerAction: () => void;
}

const FabContext = createContext<FabContextType | undefined>(undefined);

export function FabProvider({ children }: { children: React.ReactNode }) {
  const [action, setAction] = useState<FabAction | null>(null);

  // Permet à la page (Home, ToyPage) d'enregistrer sa propre fonction
  const registerAction = useCallback((newAction: FabAction) => {
    setAction(() => newAction);
  }, []);

  // Appelé par le BottomNav
  const triggerAction = useCallback(() => {
    if (action) {
      action();
    } else {
      console.log("Aucune action définie pour le FAB");
    }
  }, [action]);

  return (
    <FabContext.Provider value={{ registerAction, triggerAction }}>
      {children}
    </FabContext.Provider>
  );
}

export function useFab() {
  const context = useContext(FabContext);
  if (!context) {
    throw new Error("useFab doit être utilisé dans un FabProvider");
  }
  return context;
}
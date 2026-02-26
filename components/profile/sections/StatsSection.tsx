"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faCheck } from "@fortawesome/free-solid-svg-icons";
import SectionWrapper from "./SectionWrapper";

const AVAILABLE_STATS = [
  { id: "total_collection", label: "Total Collection" },
  { id: "total_pieces", label: "Total Pièces" },
  { id: "top_theme", label: "Thème Favori" },
  { id: "last_toy", label: "Dernier Ajout" },
  { id: "favorite_brand", label: "Marque Favorite" },
  { id: "top_category", label: "Catégorie Favorite" },
  { id: "oldest_toy", label: "Le + Vintage" },
  { id: "recent_additions", label: "Acquis cette année" },
  { id: "exposed_count", label: "Jouets Exposés" },
  { id: "wishlist_count", label: "Wishlist" },
];

interface StatsSectionProps {
  expanded: string | null;
  toggle: (id: string) => void;
  selectedStats: string[];
  toggleStat: (id: string) => void;
  saveStats: () => void;
  loading: boolean;
}

export default function StatsSection({ expanded, toggle, selectedStats, toggleStat, saveStats, loading }: StatsSectionProps) {
  return (
    <SectionWrapper id="stats" icon={faChartPie} title="Statistiques" expanded={expanded} toggle={toggle}>
      <div className="p-5 pt-0 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_STATS.map((s) => (
            <button
              key={s.id}
              onClick={(e) => { e.preventDefault(); toggleStat(s.id); }}
              className={`flex justify-between p-3 rounded-xl border transition-all ${selectedStats.includes(s.id) ? "bg-primary/10 border-primary text-primary" : "bg-background hover:border-primary/50"}`}
            >
              <span className="font-medium text-sm">{s.label}</span>
              {selectedStats.includes(s.id) && <FontAwesomeIcon icon={faCheck} />}
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button onClick={(e) => { e.preventDefault(); saveStats(); }} disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold">
            Enregistrer
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
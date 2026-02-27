import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: IconDefinition;
  color: string;
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group h-full overflow-hidden">
      {/* shrink-0 empêche l'icône de se réduire si le texte est très long */}
      <div
        className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform ${color}`}
      >
        <FontAwesomeIcon icon={icon} className="text-2xl" />
      </div>
      
      {/* flex-1 et min-w-0 permettent au bloc de texte de s'adapter et au truncate de bien fonctionner */}
      <div className="flex-1 min-w-0">
        <p className="text-muted-foreground text-sm font-medium truncate">{title}</p>
        <p className="text-xl font-semibold truncate">{value}</p>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{subtext}</p>
        )}
      </div>
    </div>
  );
}
import React from "react";

export const FilterStats = ({
  totalToys,
  groups,
}: {
  totalToys: number;
  groups: { label: string; count: number }[];
}) => (
  <div className="mb-4 p-3 rounded-xl border border-border bg-secondary/40">
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-2xl font-bold tabular-nums text-foreground">{totalToys}</span>
      <span className="text-xs text-muted-foreground">jouets dans le thème</span>
    </div>
    {groups.length > 0 && (
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {groups.map((group) => (
          <li key={group.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground truncate">{group.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{group.count}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

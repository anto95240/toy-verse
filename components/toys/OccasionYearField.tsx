"use client";

import React from "react";
import { FormInput } from "@/components/ui/FormInput";
import { GIFT_OCCASIONS, type GiftOccasion } from "@/lib/themeProfile";

interface OccasionYearFieldProps {
  occasion: string | null | undefined;
  year: number | null | undefined;
  disabled?: boolean;
  onOccasionChange: (occasion: GiftOccasion | null) => void;
  onYearChange: (year: number | null) => void;
  compact?: boolean;
}

/** Trois choix exclusifs. L'année n'apparaît qu'une fois l'occasion choisie. */
export function OccasionYearField({
  occasion,
  year,
  disabled,
  onOccasionChange,
  onYearChange,
  compact = false,
}: OccasionYearFieldProps) {
  function select(id: GiftOccasion) {
    if (occasion === id) {
      onOccasionChange(null);
      onYearChange(null);
      return;
    }
    onOccasionChange(id);
  }

  return (
    <div className="space-y-2">
      <p className={compact ? "text-[11px] text-gray-500 uppercase tracking-wider" : "text-sm text-muted-foreground"}>
        Occasion
      </p>
      <div className="flex flex-wrap gap-2">
        {GIFT_OCCASIONS.map((option) => {
          const active = occasion === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => select(option.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition-colors disabled:opacity-50 ${
                active
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {occasion && (
        compact ? (
          <input
            type="number"
            value={year || ""}
            disabled={disabled}
            min={1900}
            max={2100}
            placeholder="Année"
            onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
            aria-label="Année de l'occasion"
          />
        ) : (
          <FormInput
            id="giftYear"
            label="Année"
            type="number"
            value={year || ""}
            onChange={(v) => onYearChange(v ? Number(v) : null)}
            disabled={disabled}
            min={1900}
            max={2100}
          />
        )
      )}
    </div>
  );
}

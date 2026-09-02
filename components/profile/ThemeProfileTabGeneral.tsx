import React from "react";
import type { ThemeProfileInput } from "@/app/actions/themeProfiles";

export const EMOJIS = ["⚪", "🟡", "🔵", "🟠", "🔴", "🟣", "🟢", "⚙️", "🧊", "🚗", "🏖️", "🎮", "🃏", "🏆", "🎨", "🧸"];

interface ThemeProfileTabGeneralProps {
  form: ThemeProfileInput;
  setForm: React.Dispatch<React.SetStateAction<ThemeProfileInput>>;
}

export function ThemeProfileTabGeneral({ form, setForm }: ThemeProfileTabGeneralProps) {
  return (
    <div className="space-y-5">
      {/* Emoji */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-foreground">Emoji</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setForm((p) => ({ ...p, emoji: e }))}
              className={`w-10 h-10 rounded-xl text-xl transition-all border-2 ${
                form.emoji === e ? "border-primary bg-primary/20" : "border-border hover:border-primary/40"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Nom */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-foreground">Nom du profil *</label>
        <input
          value={form.label}
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
          placeholder="ex: Lego, Figurine, Cartes Pokémon…"
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Hint */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-foreground">Conseil affiché à l&apos;utilisateur</label>
        <textarea
          value={form.hint ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, hint: e.target.value || null }))}
          placeholder="ex: Commencez par le numéro de set et le nombre de pièces."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      {/* Auto-open details */}
      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
        <input
          type="checkbox"
          checked={form.auto_open_details}
          onChange={(e) => setForm((p) => ({ ...p, auto_open_details: e.target.checked }))}
          className="w-4 h-4 accent-primary"
        />
        <div>
          <p className="text-sm font-medium text-foreground">Ouvrir les détails automatiquement</p>
          <p className="text-xs text-muted-foreground">Les champs secondaires s&apos;affichent dès l&apos;ouverture du formulaire</p>
        </div>
      </label>
    </div>
  );
}

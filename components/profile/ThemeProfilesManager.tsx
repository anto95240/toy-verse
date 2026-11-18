"use client";

import React, { useState, useTransition, useEffect } from "react";
import type { ThemeProfileDB, ThemeProfileInput } from "@/app/actions/themeProfiles";
import { createThemeProfile, updateThemeProfile, deleteThemeProfile } from "@/app/actions/themeProfiles";
import ThemeProfileCard from "./ThemeProfileCard";
import ThemeProfileFormModal from "./ThemeProfileFormModal";

interface ThemeProfilesManagerProps {
  initialProfiles: ThemeProfileDB[];
}

export default function ThemeProfilesManager({ initialProfiles }: ThemeProfilesManagerProps) {
  const [profiles, setProfiles]           = useState<ThemeProfileDB[]>(initialProfiles);
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingProfile, setEditingProfile] = useState<ThemeProfileDB | null>(null);
  const [notification, setNotification]   = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition]      = useTransition();
  const [toyCountMap, setToyCountMap]     = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Charger le nombre de jouets par profil (via les thèmes qui utilisent chaque profil)
  useEffect(() => {
    async function fetchCounts() {
      if (profiles.length === 0) { setLoadingCounts(false); return; }
      try {
        const res = await fetch("/api/profile/type-toy/counts");
        if (res.ok) {
          const data = await res.json() as Record<string, number>;
          setToyCountMap(data);
        }
      } catch { /* ignore */ }
      finally { setLoadingCounts(false); }
    }
    void fetchCounts();
  }, [profiles]);

  function notify(type: "success" | "error", message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  function openCreate() { setEditingProfile(null); setIsFormOpen(true); }
  function openEdit(profile: ThemeProfileDB) { setEditingProfile(profile); setIsFormOpen(true); }

  function handleSave(input: ThemeProfileInput) {
    startTransition(async () => {
      if (editingProfile) {
        const result = await updateThemeProfile(editingProfile.id, input);
        if (result.success) {
          setProfiles((prev) => prev.map((p) => p.id === editingProfile.id ? { ...p, ...input } : p));
          notify("success", `Profil "${input.label}" mis à jour`);
        } else {
          notify("error", result.error ?? "Erreur");
        }
      } else {
        const result = await createThemeProfile(input);
        if (result.success && result.profile) {
          setProfiles((prev) => [...prev, result.profile!]);
          notify("success", `Profil "${input.label}" créé`);
        } else {
          notify("error", result.error ?? "Erreur");
        }
      }
      setIsFormOpen(false);
    });
  }

  function handleDelete(profile: ThemeProfileDB) {
    if (!confirm(`Supprimer le profil "${profile.label}" ? Les thèmes qui l&apos;utilisaient seront réinitialisés.`)) return;
    startTransition(async () => {
      const result = await deleteThemeProfile(profile.id);
      if (result.success) {
        setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
        notify("success", `Profil "${profile.label}" supprimé`);
      } else {
        notify("error", result.error ?? "Erreur");
      }
    });
  }

  const totalToys = Object.values(toyCountMap).reduce((acc, n) => acc + n, 0);

  return (
    <div className="space-y-8">

      {/* ── En-tête avec stats ── */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mes types de jouets</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Chaque profil détermine quels champs seront demandés lors de l&apos;ajout d&apos;un jouet.
            </p>
          </div>
          <button
            onClick={openCreate}
            disabled={isPending}
            className="shrink-0 btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            <span>+</span> Nouveau type
          </button>
        </div>

        {/* Stats rapides */}
        {!loadingCounts && profiles.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-foreground font-semibold">{profiles.length}</span> type(s) de jouet
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5">
              <span className="text-foreground font-semibold">{totalToys}</span> jouet(s) assigné(s)
            </span>
          </div>
        )}
      </div>

      {/* ── Notification ── */}
      {notification && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${
          notification.type === "success"
            ? "bg-green-500/15 border-green-400/25 text-green-600 dark:text-green-300"
            : "bg-red-500/15 border-red-400/25 text-red-600 dark:text-red-300"
        }`}>
          {notification.message}
        </div>
      )}

      {/* ── Grille de profils ── */}
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
          <div className="text-5xl mb-4">🧩</div>
          <p className="font-medium text-foreground">Aucun type de jouet créé</p>
          <p className="text-sm mt-1">Cliquez sur &ldquo;+ Nouveau type&rdquo; pour commencer.</p>
          <button onClick={openCreate} className="mt-4 btn-primary px-5 py-2 text-sm">
            + Créer mon premier type
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((profile) => (
            <ThemeProfileCard
              key={profile.id}
              profile={profile}
              toyCount={loadingCounts ? undefined : (toyCountMap[profile.id] ?? 0)}
              onEdit={() => openEdit(profile)}
              onDelete={() => handleDelete(profile)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* ── Modal formulaire ── */}
      {isFormOpen && (
        <ThemeProfileFormModal
          profile={editingProfile}
          onSave={handleSave}
          onClose={() => setIsFormOpen(false)}
          isPending={isPending}
        />
      )}
    </div>
  );
}

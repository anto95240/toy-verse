"use client";

import React, { useState, useTransition } from "react";
import type { ThemeProfileDB, ThemeProfileInput } from "@/app/actions/themeProfiles";
import { createThemeProfile, updateThemeProfile, deleteThemeProfile } from "@/app/actions/themeProfiles";
import ThemeProfileCard from "./ThemeProfileCard";
import ThemeProfileFormModal from "./ThemeProfileFormModal";

interface ThemeProfilesManagerProps {
  initialProfiles: ThemeProfileDB[];
}

export default function ThemeProfilesManager({ initialProfiles }: ThemeProfilesManagerProps) {
  const [profiles, setProfiles] = useState<ThemeProfileDB[]>(initialProfiles);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ThemeProfileDB | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function notify(type: "success" | "error", message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  function openCreate() {
    setEditingProfile(null);
    setIsFormOpen(true);
  }

  function openEdit(profile: ThemeProfileDB) {
    setEditingProfile(profile);
    setIsFormOpen(true);
  }

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
    if (!confirm(`Supprimer le profil "${profile.label}" ? Les thèmes qui l'utilisaient seront réinitialisés.`)) return;
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mes types de jouets</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Chaque profil détermine quels champs seront demandés lors de l&apos;ajout d&apos;un jouet.
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={isPending}
          className="btn-primary px-4 py-2 text-sm"
        >
          + Nouveau type
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          notification.type === "success"
            ? "bg-green-500/20 border border-green-400/30 text-green-300"
            : "bg-red-500/20 border border-red-400/30 text-red-300"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Liste des profils */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <ThemeProfileCard
            key={profile.id}
            profile={profile}
            onEdit={() => openEdit(profile)}
            onDelete={() => handleDelete(profile)}
            isPending={isPending}
          />
        ))}
        {profiles.length === 0 && (
          <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">
            Aucun profil. Cliquez sur &ldquo;+ Nouveau type&rdquo; pour commencer.
          </div>
        )}
      </div>

      {/* Modal formulaire */}
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

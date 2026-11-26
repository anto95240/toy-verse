"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faImage, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FormInput } from "@/components/ui/FormInput";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getThemeProfile } from "@/lib/themeProfile";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

const LEGACY_PROFILE_LABELS: Record<string, string> = {
  lego: "Lego",
  puzzle: "Puzzle",
  puzzle3d: "Puzzle 3D",
  pop: "Funko Pop",
  figurine: "Figurine",
  construction: "Autre jouet de construction",
  playmobil: "Playmobil",
  meccano: "Jeux de construction",
  vehicule: "Véhicule / Modèle réduit",
  souvenir: "Souvenir / Voyage",
  default: "Par défaut",
};

function normalizeLabel(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Plus long libellé contenu comme mot entier. Évite qu'un type court (« Puzzle ») vole un nom plus précis. */
function matchDbProfile(name: string, profiles: ThemeProfileDB[]): string | null {
  const normName = normalizeLabel(name);
  let best: { id: string; length: number } | null = null;

  for (const profile of profiles) {
    const label = normalizeLabel(profile.label);
    if (label.length < 3) continue;
    const regex = new RegExp(`\\b${escapeRegExp(label)}\\b`, "i");
    if (regex.test(normName) && (!best || label.length > best.length)) {
      best = { id: profile.id, length: label.length };
    }
  }
  if (best) return best.id;

  const detected = getThemeProfile(name);
  const wanted = normalizeLabel(LEGACY_PROFILE_LABELS[detected.id] ?? detected.label);
  return profiles.find((profile) => normalizeLabel(profile.label) === wanted)?.id ?? null;
}

function resolveStoredProfileId(stored: string | null, profiles: ThemeProfileDB[]): string {
  if (!stored) return "";
  if (profiles.some((profile) => profile.id === stored)) return stored;
  const label = LEGACY_PROFILE_LABELS[stored];
  if (!label || profiles.length === 0) return stored;
  return profiles.find((profile) => normalizeLabel(profile.label) === normalizeLabel(label))?.id ?? stored;
}

interface ThemeFormProps {
  initialName: string;
  initialImageUrl: string | null;
  initialProfileId: string | null;
  onSubmit: (name: string, file: File | null, profileId: string | null) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
}

export default function ThemeForm({
  initialName,
  initialImageUrl,
  initialProfileId,
  onSubmit,
  onCancel,
  loading,
  isEditing,
}: ThemeFormProps) {
  const [name, setName] = useState(initialName);
  const [profileId, setProfileId] = useState<string>(initialProfileId ?? "");
  const [profileTouched, setProfileTouched] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dbProfiles, setDbProfiles] = useState<ThemeProfileDB[]>([]);
  const supabase = getSupabaseClient();

  // Charger les profils depuis la DB au montage
  useEffect(() => {
    fetch("/api/profile/theme-profiles")
      .then((r) => r.json())
      .then((json) => { if (json.profiles) setDbProfiles(json.profiles); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setName(initialName);
    setProfileTouched(false);
    setProfileId(resolveStoredProfileId(initialProfileId, dbProfiles));
    if (initialImageUrl) {
      if (initialImageUrl.startsWith("http")) setPreview(initialImageUrl);
      else
        supabase.storage
          .from("toys-images")
          .createSignedUrl(initialImageUrl, 3600)
          .then(({ data }) => setPreview(data?.signedUrl || null));
    } else {
      setPreview(null);
    }
    setImageFile(null);
  }, [initialName, initialImageUrl, initialProfileId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  // À l'édition, le type enregistré reste celui choisi. La suggestion ne s'applique qu'à la création.
  useEffect(() => {
    if (profileTouched) return;
    if (isEditing) {
      setProfileId(resolveStoredProfileId(initialProfileId, dbProfiles));
      return;
    }
    if (name.trim().length < 3 || dbProfiles.length === 0) return;
    const next = matchDbProfile(name, dbProfiles);
    if (next) setProfileId(next);
  }, [name, dbProfiles, isEditing, profileTouched, initialProfileId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, imageFile, profileId || null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        id="theme-name"
        label="Nom du thème"
        value={name}
        onChange={setName}
        disabled={loading}
        required
      />

      <div className="space-y-1">
        <label htmlFor="theme-profile" className="block text-sm font-semibold text-foreground">
          Type de jouet (Profil)
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Détermine les champs qui te seront demandés (Numéro, Pièces, etc.).
        </p>
        <select
          id="theme-profile"
          value={profileId}
          onChange={(e) => {
            setProfileId(e.target.value);
            setProfileTouched(true);
          }}
          disabled={loading || dbProfiles.length === 0}
          className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer dark:bg-slate-800"
        >
          <option value="" disabled>
            {dbProfiles.length === 0 ? "Chargement des types…" : "Choisir un type"}
          </option>
          {profileId && !dbProfiles.some((profile) => profile.id === profileId) && (
            <option value={profileId}>Type enregistré</option>
          )}
          {dbProfiles.map((profile) => (
            <option key={profile.id} value={profile.id} className="bg-white text-black dark:bg-slate-800 dark:text-white">
              {profile.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <FontAwesomeIcon icon={faImage} className="text-xs" />
          </div>
          Image du thème
        </label>
        <div className="relative group border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/70 transition-all duration-300 cursor-pointer bg-secondary/30 hover:bg-secondary/50">
          <input
            type="file"
            accept="image/*"
            aria-label="choix d'une image"
            onChange={handleImageChange}
            disabled={loading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <FontAwesomeIcon
                icon={faUpload}
                className="w-6 h-6 text-primary"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Cliquez pour choisir une image
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF jusqu&apos;à 10MB
              </p>
            </div>
          </div>
        </div>
        {preview && (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-border shadow-md hover:shadow-lg transition-shadow duration-300">
            <Image src={preview} alt="Aperçu" fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary flex-1 py-3"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              Chargement...
            </span>
          ) : isEditing ? (
            "Modifier"
          ) : (
            "Créer"
          )}
        </button>
      </div>
    </form>
  );
}

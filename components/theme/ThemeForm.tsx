"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faImage, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FormInput } from "@/components/ui/FormInput";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getThemeProfile } from "@/lib/themeProfile";
import type { ThemeProfileDB } from "@/app/actions/themeProfiles";

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
  const [profileId, setProfileId] = useState<string>(initialProfileId || "default");
  const [hasManuallyChangedProfile, setHasManuallyChangedProfile] = useState(false);
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
    setProfileId(initialProfileId || "default");
    setHasManuallyChangedProfile(!!initialProfileId && initialProfileId !== "default");
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
  }, [initialName, initialImageUrl, initialProfileId, supabase]);

  // Auto-détection intelligente du profil quand le nom change
  useEffect(() => {
    if (!hasManuallyChangedProfile && name.trim().length > 2) {
      // Cherche d'abord dans les profils DB par label
      const normName = name.toLowerCase();
      const matchedDb = dbProfiles.find((p) =>
        normName.includes(p.label.toLowerCase())
      );
      if (matchedDb) {
        if (matchedDb.id !== profileId) setProfileId(matchedDb.id);
      } else {
        // Fallback sur la détection legacy
        const detected = getThemeProfile(name);
        // Chercher l'équivalent DB du profil legacy détecté
        const dbEquiv = dbProfiles.find((p) => p.label === detected.label);
        const targetId = dbEquiv?.id ?? detected.id;
        if (targetId !== profileId) setProfileId(targetId);
      }
    }
  }, [name, hasManuallyChangedProfile, dbProfiles]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, imageFile, profileId === "default" ? null : profileId);
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
            setHasManuallyChangedProfile(true);
          }}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl border border-border bg-secondary/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer dark:bg-slate-800"
        >
          {dbProfiles.length > 0
            ? dbProfiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-black dark:bg-slate-800 dark:text-white">
                  {p.emoji} {p.label}
                </option>
              ))
            : /* fallback si la DB n'a pas encore répondu */ (
                <option value={profileId}>{profileId}</option>
              )
          }
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

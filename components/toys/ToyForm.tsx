"use client";

import React from "react";
import type { Toy } from "@/types/theme";
import Image from "next/image";
import { FormInput } from "@/components/ui/FormInput";

interface ToyFormProps {
  form: Omit<Toy, "id" | "created_at">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Toy, "id" | "created_at">>>;
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  setShowImagePopup: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ToyForm({
  form,
  setForm,
  previewUrl,
  setPreviewUrl,
  setFile,
  setShowImagePopup,
  loading,
  onSubmit,
  onClose,
}: ToyFormProps) {
  const updateField = (field: keyof Toy, value: string | number | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormInput
        id="nom"
        label="Nom"
        value={form.nom}
        onChange={(v) => updateField("nom", v)}
        disabled={loading}
        required
      />
      <FormInput
        id="taille"
        label="Taille"
        value={form.taille || ""}
        onChange={(v) => updateField("taille", v)}
        disabled={loading}
      />
      <FormInput
        id="nb_pieces"
        label="Nombre de pièces"
        type="number"
        value={form.nb_pieces}
        onChange={(v) => updateField("nb_pieces", v ? Number(v) : null)}
        disabled={loading}
        min={0}
      />
      <FormInput
        id="numero"
        label="Numéro"
        type="number"
        value={form.numero || ""}
        onChange={(v) => updateField("numero", v)}
        disabled={loading}
      />
      <FormInput
        id="category"
        label="Catégorie"
        value={form.categorie || ""}
        onChange={(v) => updateField("categorie", v)}
        disabled={loading}
      />
      <FormInput
        id="studio"
        label="Studio/License/Lieux"
        value={form.studio || ""}
        onChange={(v) => updateField("studio", v)}
        disabled={loading}
      />
      <FormInput
        id="releaseDate"
        label="Année de sortie"
        type="number"
        value={form.release_date}
        onChange={(v) => updateField("release_date", v ? Number(v) : null)}
        disabled={loading}
        min={1900}
        max={2100}
      />

      <div className="flex gap-6">
        {(["is_exposed", "is_soon"] as const).map((field) => (
          <label
            key={field}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!form[field]}
              onChange={(e) => updateField(field, e.target.checked)}
              disabled={loading}
            />
            <span>{field === "is_exposed" ? "Exposé" : "Prochainement"}</span>
          </label>
        ))}
      </div>

      <div className="space-y-3">
        <label className="block font-medium">Photo du jouet</label>
        <button
          type="button"
          onClick={() => setShowImagePopup(true)}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {previewUrl ? `Changer l'image` : `Choisir une image`}
        </button>
        {previewUrl && (
          <div className="relative w-fit">
            <Image
              src={previewUrl}
              alt="Aperçu"
              width={500}
              height={500}
              className="max-h-48 object-contain rounded-md border"
            />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setFile(null);
                updateField("photo_url", null);
              }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 rounded text-white"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

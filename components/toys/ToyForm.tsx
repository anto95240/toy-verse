
"use client"

import React from "react"
import type { Toy } from "@/types/theme"
import Image from "next/image"

interface ToyFormProps {
  form: Omit<Toy, "id" | "created_at">
  setForm: React.Dispatch<React.SetStateAction<Omit<Toy, "id" | "created_at">>>
  previewUrl: string | null
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>
  setFile: React.Dispatch<React.SetStateAction<File | null>>
  setShowImagePopup: React.Dispatch<React.SetStateAction<boolean>>
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
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
  onClose
}: ToyFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Nom */}
      <div className="relative">
        <input
          type="text"
          id="nom"
          value={form.nom}
          onChange={e => setForm({ ...form, nom: e.target.value })}
          required
          className="peer text-[#2d3748] w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=""
          disabled={loading}
        />
        <label
          htmlFor="nom"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Nom
        </label>
      </div>

      {/* Taille */}
      <div className="relative">
        <input
          type="text"
          id="taille"
          value={form.taille || ""}
          onChange={e => setForm({ ...form, taille: e.target.value })}
          className="peer text-[#2d3748] w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=""
          disabled={loading}
        />
        <label
          htmlFor="taille"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Taille
        </label>
      </div>

      {/* Nombre de pièces */}
      <div className="relative">
        <input
          id="nb_pieces"
          type="number"
          value={form.nb_pieces ?? ""}
          onChange={e =>
            setForm({ ...form, nb_pieces: e.target.value ? Number(e.target.value) : null })
          }
          disabled={loading}
          min={0}
          className="peer text-[#2d3748] w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=""
        />
        <label
          htmlFor="nb_pieces"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Nombre de pièces
        </label>
      </div>

      {/* Numéro */}
      <div className="relative">
        <input
          type="number"
          id="numero"
          value={form.numero || ""}
          onChange={e => setForm({ ...form, numero: e.target.value })}
          disabled={loading}
          className="peer text-[#2d3748] w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder=""
        />
        <label
          htmlFor="numero"
          className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
        >
          Numéro
        </label>
      </div>

      {/* Catégorie, Studio/License et Année de sortie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-prim mb-2">
            Catégorie
          </label>
          <input
            type="text"
            value={form.categorie || ""}
            onChange={(e) => setForm(prev => ({ ...prev, categorie: e.target.value }))}
            className="w-full p-3 bg-bg-third/50 border border-white/10 rounded-xl text-text-prim placeholder-text-second/60 focus:outline-none focus:ring-2 focus:ring-btn-add/50 focus:border-btn-add transition-all"
            placeholder="ex: Figurine, Véhicule..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-prim mb-2">
            Studio/License
          </label>
          <input
            type="text"
            value={form.studio}
            onChange={(e) => setForm(prev => ({ ...prev, studio: e.target.value }))}
            className="w-full p-3 bg-bg-third/50 border border-white/10 rounded-xl text-text-prim placeholder-text-second/60 focus:outline-none focus:ring-2 focus:ring-btn-add/50 focus:border-btn-add transition-all"
            placeholder="ex: Disney, Marvel..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-prim mb-2">
          Année de sortie
        </label>
        <input
          type="number"
          min="1900"
          max="2100"
          value={form.release_date || ''}
          onChange={(e) => setForm(prev => ({ ...prev, release_date: e.target.value || null }))}
          className="w-full p-3 bg-bg-third/50 border border-white/10 rounded-xl text-text-prim placeholder-text-second/60 focus:outline-none focus:ring-2 focus:ring-btn-add/50 focus:border-btn-add transition-all"
          placeholder="ex: 2023"
        />
      </div>

      {/* Checkboxes */}
      <label className="flex items-center space-x-2">
        <input
          id="is_exposed"
          type="checkbox"
          checked={form.is_exposed}
          onChange={e => setForm({ ...form, is_exposed: e.target.checked })}
          disabled={loading}
        />
        <span>Exposé</span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          id="is_soon"
          type="checkbox"
          checked={form.is_soon}
          onChange={e => setForm({ ...form, is_soon: e.target.checked })}
          disabled={loading}
        />
        <span>Prochainement</span>
      </label>

      {/* Section Photo */}
      <div className="space-y-3">
        <label className="block font-medium">Photo du jouet</label>

        {/* Bouton principal pour choisir une image */}
        <button
          type="button"
          onClick={() => setShowImagePopup(true)}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {previewUrl ? `Changer l'image` : `Choisir une image`}
        </button>

        {/* Preview de l"image */}
        {previewUrl && (
          <div className="relative">
            <Image
              src={previewUrl}
              alt="Aperçu"
              width={100}
              height={40}
              className="w-full max-h-48 object-contain rounded-md border"
            />
            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null)
                setFile(null)
                setForm({ ...form, photo_url: null })
              }}
              disabled={loading}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
              title="Supprimer l&apos;image"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 rounded"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  )
}

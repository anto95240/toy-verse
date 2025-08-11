'use client'
import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'

interface ToyModalProps {
  isOpen: boolean
  onClose: () => void
  toy?: Toy | null
  themeId: string
  onSave: (toy: Toy) => void
  toyToEdit?: Toy | null
}

export default function ToyModal({ isOpen, onClose, themeId, onSave, toyToEdit }: ToyModalProps) {
  const supabase = getSupabaseClient()
  const [form, setForm] = useState<Omit<Toy, 'id' | 'created_at'>>({
    theme_id: themeId,
    nom: '',
    taille: '',
    nb_pieces: null,
    numero: '',
    is_exposed: false,
    is_soon: false,
    photo_url: null,
    categorie: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Met à jour theme_id si themeId change
  useEffect(() => {
    setForm(f => ({ ...f, theme_id: themeId }))
  }, [themeId])

  // Initialisation ou reset du formulaire à l'ouverture/modification
  useEffect(() => {
    if (toyToEdit) {
      setForm({
        theme_id: themeId,
        nom: toyToEdit.nom,
        taille: toyToEdit.taille,
        nb_pieces: toyToEdit.nb_pieces,
        numero: toyToEdit.numero,
        is_exposed: toyToEdit.is_exposed,
        is_soon: toyToEdit.is_soon,
        photo_url: toyToEdit.photo_url,
        categorie: toyToEdit.categorie,
      })
      setFile(null)
    } else {
      setForm({
        theme_id: themeId,
        nom: '',
        taille: '',
        nb_pieces: null,
        numero: '',
        is_exposed: false,
        is_soon: false,
        photo_url: null,
        categorie: '',
      })
      setFile(null)
    }
  }, [toyToEdit, themeId])

  // Génération et nettoyage de l'URL d'aperçu de l'image
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  async function uploadImageIfNeeded() {
    if (!file) return form.photo_url || null

    const filePath = `toys/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
        .from('toys-images')
        .upload(filePath, file, { upsert: true })
    if (error) throw error

    // getPublicUrl n'est pas async et ne renvoie pas d'erreur
    const { data } = supabase.storage.from('toys-images').getPublicUrl(filePath)

    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nom.trim()) {
      alert('Le nom du jouet est obligatoire')
      return
    }
    if (form.nb_pieces !== null && form.nb_pieces < 0) {
      alert('Le nombre de pièces ne peut pas être négatif')
      return
    }
    setLoading(true)
    try {
      const photoUrl = await uploadImageIfNeeded()

      if (toyToEdit) {
        const { data, error } = await supabase
          .from('toys')
          .update({ ...form, photo_url: photoUrl })
          .eq('id', toyToEdit.id)
          .select()
          .single()
        if (error) throw error
        onSave(data)
      } else {
        const { data, error } = await supabase
          .from('toys')
          .insert([{ ...form, photo_url: photoUrl }])
          .select()
          .single()
        if (error) throw error
        onSave(data)
      }
      onClose()
    } catch (err) {
      console.error('Erreur ajout/modif jouet:', err)
      alert('Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4"
        noValidate
        
      >
        <h2 className="text-lg font-bold">{toyToEdit ? 'Modifier le jouet' : 'Nouveau jouet'}</h2>

        <label htmlFor="nom" className="block font-medium">Nom</label>
        <input
          id="nom"
          value={form.nom}
          onChange={e => setForm({ ...form, nom: e.target.value })}
          required
          disabled={loading}
          className="border p-2 w-full"
          placeholder="Nom"
        />

        <label htmlFor="taille" className="block font-medium">Taille</label>
        <input
          id="taille"
          value={form.taille || ''}
          onChange={e => setForm({ ...form, taille: e.target.value })}
          disabled={loading}
          className="border p-2 w-full"
          placeholder="Taille"
        />

        <label htmlFor="nb_pieces" className="block font-medium">Nombre de pièces</label>
        <input
          id="nb_pieces"
          type="number"
          value={form.nb_pieces ?? ''}
          onChange={e => setForm({ ...form, nb_pieces: e.target.value ? Number(e.target.value) : null })}
          disabled={loading}
          className="border p-2 w-full"
          placeholder="Nombre de pièces"
          min={0}
        />

        <label htmlFor="numero" className="block font-medium">Numéro</label>
        <input
          id="numero"
          value={form.numero || ''}
          onChange={e => setForm({ ...form, numero: e.target.value })}
          disabled={loading}
          className="border p-2 w-full"
          placeholder="Numéro"
        />

        <label htmlFor="categorie" className="block font-medium">Catégorie</label>
        <input
          id="categorie"
          value={form.categorie || ''}
          onChange={e => setForm({ ...form, categorie: e.target.value })}
          disabled={loading}
          className="border p-2 w-full"
          placeholder="Catégorie"
        />

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

        <label htmlFor="photo" className="block font-medium">Photo du jouet</label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          disabled={loading}
          className="border p-2 w-full"
          aria-describedby="photo-desc"
        />
        <small id="photo-desc" className="text-gray-600">Formats d’image acceptés : jpg, png, etc.</small>

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Aperçu de l'image"
            className="mt-2 max-h-40 object-contain"
          />
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            disabled={loading}
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

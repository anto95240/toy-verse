'use client'
import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'

interface ToyModalProps {
  isOpen: boolean
  onClose: () => void
  themeId: string
  onSave: (toy: Toy) => void
  toy: Toy | null
}

export default function ToyModal({ isOpen, onClose, themeId, onSave, toy }: ToyModalProps) {
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
  const [showImageOptions, setShowImageOptions] = useState(false)

  // Met à jour theme_id si themeId change
  useEffect(() => {
    setForm(f => ({ ...f, theme_id: themeId }))
  }, [themeId])

  // Fonction pour obtenir l'URL signée d'une image
  async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath

    const fullPath = imagePath.startsWith('toys/') ? imagePath : `toys/${imagePath}`
    const { data, error } = await supabase.storage
      .from('toys-images')
      .createSignedUrl(fullPath, 3600)

    if (error) {
      console.error('Erreur création URL signée:', error)
      return null
    }
    return data.signedUrl
  }

  // Initialisation ou reset du formulaire à l'ouverture/modification
  useEffect(() => {
    async function setupForm() {
      if (toy) {
        setForm({
          theme_id: themeId,
          nom: toy.nom,
          taille: toy.taille,
          nb_pieces: toy.nb_pieces,
          numero: toy.numero,
          is_exposed: toy.is_exposed,
          is_soon: toy.is_soon,
          photo_url: toy.photo_url,
          categorie: toy.categorie,
        })
        setFile(null)
        
        // Charger l'image existante pour la preview
        if (toy.photo_url) {
          const signedUrl = await getSignedImageUrl(toy.photo_url)
          setPreviewUrl(signedUrl)
        } else {
          setPreviewUrl(null)
        }
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
        setPreviewUrl(null)
      }
    }

    if (isOpen) {
      setupForm()
    }
  }, [toy, themeId, isOpen])

  // Génération et nettoyage de l'URL d'aperçu de l'image pour les nouveaux fichiers
  useEffect(() => {
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  // Gestion du choix d'image depuis fichier local
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setShowImageOptions(false)
    }
  }

  // Gestion de la prise de photo (caméra)
  function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const capturedFile = e.target.files?.[0]
    if (capturedFile) {
      setFile(capturedFile)
      setShowImageOptions(false)
    }
  }

  async function uploadImageIfNeeded() {
    if (!file) return form.photo_url || null

    const filePath = `toys/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('toys-images')
      .upload(filePath, file, { upsert: true })
    
    if (error) throw error

    return filePath
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

      if (toy) {
        const { data, error } = await supabase
          .from('toys')
          .update({ ...form, photo_url: photoUrl })
          .eq('id', toy.id)
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
        className="bg-white p-6 rounded-lg w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
        noValidate
      >
        <h2 className="text-lg font-bold">
          {toy ? 'Modifier le jouet' : 'Nouveau jouet'}
        </h2>

        {/* Nom */}
        <div className="relative">
          <input
            type="text"
            id="nom"
            value={form.nom}
            onChange={e => setForm({ ...form, nom: e.target.value })}
            required
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            type='text'
            id="taille"
            value={form.taille || ''}
            onChange={e => setForm({ ...form, taille: e.target.value })}
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={form.nb_pieces ?? ''}
            onChange={e =>
              setForm({ ...form, nb_pieces: e.target.value ? Number(e.target.value) : null })
            }
            disabled={loading}
            min={0}
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            type='text'
            id="numero"
            value={form.numero || ''}
            onChange={e => setForm({ ...form, numero: e.target.value })}
            disabled={loading}
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=""
          />
          <label
            htmlFor="numero"
            className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
          >
            Numéro
          </label>
        </div>

        {/* Catégorie */}
        <div className="relative">
          <input
            type='text'
            id="categorie"
            value={form.categorie || ''}
            onChange={e => setForm({ ...form, categorie: e.target.value })}
            disabled={loading}
            className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=""
          />
          <label
            htmlFor="categorie"
            className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
          >
            Catégorie
          </label>
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
            onClick={() => setShowImageOptions(!showImageOptions)}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {previewUrl ? 'Changer l\'image' : 'Choisir une image'}
          </button>

          {/* Options d'image (affichées conditionnellement) */}
          {showImageOptions && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="file-input" className="block">
                  <div className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-center">
                    📁 Choisir depuis l'ordinateur
                  </div>
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={loading}
                  className="hidden"
                />
              </div>
              
              <div>
                <label htmlFor="camera-input" className="block">
                  <div className="cursor-pointer px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-center">
                    📷 Prendre une photo
                  </div>
                </label>
                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  disabled={loading}
                  className="hidden"
                />
              </div>
              
              <button
                type="button"
                onClick={() => setShowImageOptions(false)}
                className="w-full px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Preview de l'image */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Aperçu"
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
                title="Supprimer l'image"
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
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            disabled={loading}
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
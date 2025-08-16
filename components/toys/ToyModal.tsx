'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'
import ToyForm from './ToyForm'
import ImageUploadPopup from './ImageUploadPopup'

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
  const [showImagePopup, setShowImagePopup] = useState(false)

  // Met à jour theme_id si themeId change
  useEffect(() => {
    setForm(f => ({ ...f, theme_id: themeId }))
  }, [themeId])

  // Fonction pour obtenir l'URL signée d'une image
  const getSignedImageUrl = useCallback(
    async (imagePath: string | null): Promise<string | null> => {
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
    },
    [supabase]
  )

  // Met à jour theme_id si themeId change
  useEffect(() => {
    setForm(f => ({ ...f, theme_id: themeId }))
  }, [themeId])

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
  }, [toy, themeId, isOpen, getSignedImageUrl])

  // Génération et nettoyage de l'URL d'aperçu de l'image pour les nouveaux fichiers
  useEffect(() => {
    if (!file) return

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
      <div className="bg-bg-second p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">
          {toy ? 'Modifier le jouet' : 'Nouveau jouet'}
        </h2>

        <ToyForm
          form={form}
          setForm={setForm}
          previewUrl={previewUrl}
          setPreviewUrl={setPreviewUrl}
          setFile={setFile}
          setShowImagePopup={setShowImagePopup}
          loading={loading}
          onSubmit={handleSubmit}
          onClose={onClose}
        />

        <ImageUploadPopup
          isOpen={showImagePopup}
          onClose={() => setShowImagePopup(false)}
          onFileSelect={setFile}
          loading={loading}
        />
      </div>
    </div>
  )
}
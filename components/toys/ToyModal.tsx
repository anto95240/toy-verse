'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'
import ToyForm from './ToyForm'
import ImageUploadPopup from './ImageUploadPopup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '@/context/ToastContext'

interface ToyModalProps {
  isOpen: boolean
  onClose: () => void
  themeId: string
  userId: string
  onSave: (toy: Toy) => void
  toy: Toy | null
}

export default function ToyModal({ isOpen, onClose, themeId, userId, onSave, toy }: ToyModalProps) {
  const supabase = getSupabaseClient()
  const { showToast } = useToast()

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
    studio: '',
    user_id: userId,
    release_date: null,
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImagePopup, setShowImagePopup] = useState(false)

  // Met à jour le theme_id si les props changent
  useEffect(() => {
    setForm(f => ({ ...f, theme_id: themeId }))
  }, [themeId])

  // Fonction pour récupérer l'URL signée de l'image
  const getSignedImageUrl = useCallback(
    async (filePath: string | null): Promise<string | null> => {
      if (!filePath) return null
      if (filePath.startsWith('http')) return filePath

      const { data, error } = await supabase.storage
        .from('toys-images')
        .createSignedUrl(filePath, 3600)

      if (error) {
        console.error('Erreur création URL signée:', error)
        return null
      }
      return data.signedUrl
    },
    [supabase]
  )

  // Initialisation du formulaire à l'ouverture
  useEffect(() => {
    async function setupForm() {
      if (toy) {
        setForm({
          theme_id: themeId,
          user_id: userId,
          nom: toy.nom,
          taille: toy.taille,
          nb_pieces: toy.nb_pieces,
          numero: toy.numero,
          is_exposed: toy.is_exposed,
          is_soon: toy.is_soon,
          photo_url: toy.photo_url,
          categorie: toy.categorie,
          studio: toy.studio,
          release_date: toy.release_date,
        })
        setFile(null)
        
        if (toy.photo_url) {
          const signedUrl = await getSignedImageUrl(toy.photo_url)
          setPreviewUrl(signedUrl)
        } else {
          setPreviewUrl(null)
        }
      } else {
        // Réinitialisation pour un nouveau jouet
        setForm({
            theme_id: themeId,
            user_id: userId,
            nom: '',
            taille: '',
            nb_pieces: null,
            numero: '',
            is_exposed: false,
            is_soon: false,
            photo_url: null,
            categorie: '',
            studio: '',
            release_date: null,
        })
        setFile(null)
        setPreviewUrl(null)
      }
    }

    if (isOpen) {
      setupForm()
    }
  }, [toy, themeId, userId, isOpen, getSignedImageUrl])

  // Gestion de la prévisualisation de l'image uploadée
  useEffect(() => {
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  // Upload de l'image si nécessaire
  async function uploadImageIfNeeded(): Promise<string | null> {
    if (!file) return form.photo_url || null

    const filePath = `toys/${userId}/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('toys-images')
      .upload(filePath, file, { upsert: true })
    
    if (error) throw error

    return filePath
  }

  // --- SOUMISSION DU FORMULAIRE ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validations
    if (!form.nom.trim()) {
        return showToast('Le nom du jouet est obligatoire', 'error')
    }
    if (form.nb_pieces !== null && form.nb_pieces < 0) {
        return showToast('Le nombre de pièces ne peut pas être négatif', 'error')
    }

    // SCÉNARIO 1 : MODIFICATION INSTANTANÉE (Optimistic UI)
    // Si on modifie un jouet existant sans changer l'image
    if (toy && !file) {
      const optimisticToy: Toy = {
        ...toy,
        ...form,
        id: toy.id,
        created_at: toy.created_at,
        photo_url: form.photo_url
      }
      
      // Mise à jour immédiate de l'interface
      onSave(optimisticToy)
      onClose()
      showToast("Jouet modifié avec succès", "success")

      // Sauvegarde en arrière-plan
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('toys') as any)
        .update(form)
        .eq('id', toy.id)
      
      if (error) {
        console.error("Erreur save background:", error)
        showToast("Erreur lors de la sauvegarde en arrière-plan", "error")
      }
      return
    }

    // SCÉNARIO 2 : CRÉATION OU UPLOAD D'IMAGE (Nécessite chargement)
    setLoading(true)
    try {
      const photoUrl = await uploadImageIfNeeded()

      if (toy) {
        // Update avec nouvelle image
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('toys') as any)
          .update({ ...form, photo_url: photoUrl })
          .eq('id', toy.id)
          .select()
          .single()
          
        if (error) throw error
        onSave(data)
        showToast("Jouet modifié avec succès", "success")
      } else {
        // Création nouveau jouet
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('toys') as any)
          .insert([{ ...form, photo_url: photoUrl }])
          .select()
          .single()
          
        if (error) throw error
        onSave(data)
        showToast("Nouveau jouet ajouté !", "success")
      }
      onClose()
    } catch (err: unknown) {
      let message = 'Erreur inconnue'
      if (err instanceof Error) message = err.message
      showToast(`Erreur: ${message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Fond dégradé */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-second via-bg-second to-bg-primary z-0"></div>

        {/* Header */}
        <div className="relative p-6 border-b border-white/10 shrink-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-btn-add/20 to-btn-choix/20 rounded-t-2xl opacity-50"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text text-transparent">
              {toy ? 'Modifier le jouet' : 'Nouveau jouet'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="group p-2 rounded-full bg-white/5 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50"
              aria-label="Fermer"
            >
              <FontAwesomeIcon 
                icon={faXmark} 
                className="w-5 h-5 text-text-prim group-hover:text-red-400 transition-colors" 
              />
            </button>
          </div>
        </div>

        {/* Formulaire Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 z-10 relative scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
        </div>

        {/* Effet visuel bordure */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-btn-add/20 via-transparent to-btn-choix/20 pointer-events-none z-20"></div>
      </div>

      {/* Popup sélection image */}
      <ImageUploadPopup
        isOpen={showImagePopup}
        onClose={() => setShowImagePopup(false)}
        onFileSelect={setFile}
        loading={loading}
      />
    </div>
  )
}
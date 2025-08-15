'use client'

import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUpload } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'

interface ThemeModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTheme: (theme: Theme) => void
  onUpdateTheme: (theme: Theme) => void
  themeToEdit?: Theme | null
}

export default function ThemeModal({ 
  isOpen, 
  onClose, 
  onAddTheme, 
  onUpdateTheme, 
  themeToEdit 
}: ThemeModalProps) {
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = getSupabaseClient()
  const isEditing = !!themeToEdit

  // Reset form when modal opens/closes or when switching between add/edit
  useEffect(() => {
    // Fonction pour obtenir l'URL publique d'une image depuis Supabase Storage
    async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath
      
      // Les images sont dans le dossier themes/ du bucket toys-images
      const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
      const { data, error } = await supabase.storage
        .from('toys-images')
        .createSignedUrl(fullPath, 3600) // 1 heure d'expiration
      
      if (error) {
        console.error('Erreur création URL signée:', error)
        return null
      }
      
      return data.signedUrl
    }

    async function setupForm() {
      if (themeToEdit) {
        setName(themeToEdit.name)
        if (themeToEdit.image_url) {
          const signedUrl = await getSignedImageUrl(themeToEdit.image_url)
          setImagePreview(signedUrl)
        } else {
          setImagePreview(null)
        }
      } else {
        setName('')
        setImagePreview(null)
      }
      setImageFile(null)
      setError('')
    }
    
    if (isOpen) {
      setupForm()
    }
  }, [isOpen, themeToEdit, supabase])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Créer une preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Le nom du thème est requis')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Récupérer la session utilisateur
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError('Vous devez être connecté pour effectuer cette action')
        setLoading(false)
        return
      }

      let imagePath = themeToEdit?.image_url || null

      // Upload de l'image si une nouvelle image est sélectionnée
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `themes/${session.user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('toys-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          setError('Erreur lors de l\'upload de l\'image: ' + uploadError.message)
          setLoading(false)
          return
        }
        
        imagePath = fileName
      }

      if (isEditing && themeToEdit) {
        // Mise à jour du thème existant
        const { data, error } = await supabase
          .from('themes')
          .update({ 
            name: name.trim(),
            image_url: imagePath
          })
          .eq('id', themeToEdit.id)
          .eq('user_id', session.user.id) // Sécurité: vérifier que l'utilisateur est propriétaire
          .select()
          .single()

        if (error) {
          setError('Erreur lors de la mise à jour: ' + error.message)
          setLoading(false)
          return
        }

        onUpdateTheme(data)
        alert('Thème mis à jour avec succès!')
      } else {
        // Création d'un nouveau thème
        const { data, error } = await supabase
          .from('themes')
          .insert({
            name: name.trim(),
            image_url: imagePath,
            user_id: session.user.id
          })
          .select()
          .single()

        if (error) {
          setError('Erreur lors de la création: ' + error.message)
          setLoading(false)
          return
        }

        onAddTheme(data)
        alert('Thème créé avec succès!')
      }

      // Reset et fermeture
      setName('')
      setImageFile(null)
      setImagePreview(null)
      onClose()
    } catch (err) {
      console.error('Erreur:', err)
      setError('Une erreur inattendue est survenue')
    }

    setLoading(false)
  }

  function handleClose() {
    if (!loading) {
      setName('')
      setImageFile(null)
      setImagePreview(null)
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Modifier le thème' : 'Ajouter un thème'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Fermer"
          >
            <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nom du thème */}
          <div className="relative">
            <input
              type="text"
              id="theme-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="peer w-full border rounded-md px-3 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
            />
            <label 
              htmlFor="theme-name" 
              className="absolute left-3 top-2 text-blue-500 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-blue-500 peer-placeholder-shown:text-sm"
            >
              Nom du thème (Ex: Lego, Playmobil, ...)
            </label>
          </div>

          {/* Upload d'image */}
          <div>
            <label htmlFor="theme-image" className="block text-sm font-medium text-gray-700 mb-2">
              Image du thème
            </label>
            <div className="space-y-3">
              <input
                type="file"
                id="theme-image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              
              {/* Preview de l'image */}
              {imagePreview && (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Aperçu"
                    className="w-full h-32 object-cover rounded-md border"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Aperçu
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  {isEditing ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUpload, faImage } from '@fortawesome/free-solid-svg-icons'
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

  useEffect(() => {
    async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath
      
      const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
      const { data, error } = await supabase.storage
        .from('toys-images')
        .createSignedUrl(fullPath, 3600)
      
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
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        setError('Vous devez être connecté pour effectuer cette action')
        setLoading(false)
        return
      }

      let imagePath = themeToEdit?.image_url || null
      if (imageFile) {
        // Convertir l'image en WebP
        const { convertToWebP, generateImagePath } = await import('@/utils/imageConverter')
        const webpFile = await convertToWebP(imageFile)
        const fileName = generateImagePath(session.user.id, 'themes')
        
        const { error: uploadError } = await supabase.storage
          .from('toys-images')
          .upload(fileName, webpFile)

        if (uploadError) {
          setError('Erreur lors de l\'upload de l\'image: ' + uploadError.message)
          setLoading(false)
          return
        }
        
        imagePath = fileName
      }

      if (isEditing && themeToEdit) {
        const { data, error } = await supabase
          .from('themes')
          .update({ 
            name: name.trim(),
            image_url: imagePath
          })
          .eq('id', themeToEdit.id)
          .eq('user_id', session.user.id)
          .select()
          .single()

        if (error) {
          setError('Erreur lors de la mise à jour: ' + error.message)
          setLoading(false)
          return
        }

        onUpdateTheme(data)
      } else {
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
      }

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-bg-second via-bg-second to-bg-primary rounded-2xl border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        
        {/* Header avec effet cyberpunk */}
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-btn-add/20 to-btn-choix/20 rounded-t-2xl"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text text-transparent">
              {isEditing ? 'Modifier le thème' : 'Créer un thème'}
            </h2>
            <button
              onClick={handleClose}
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

        {/* Form with futuristic styling */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom du thème avec design futuriste */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-btn-add/20 to-btn-choix/20 rounded-xl blur-sm group-focus-within:blur-none transition-all duration-300"></div>
            <div className="relative">
              <input
                type="text"
                id="theme-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="peer w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 pt-6 pb-3 text-text-prim placeholder-transparent focus:outline-none focus:border-btn-add/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50"
                placeholder="Nom du thème"
              />
              <label 
                htmlFor="theme-name" 
                className="absolute left-4 top-2 text-btn-add text-xs font-medium transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-text-second peer-focus:top-2 peer-focus:text-xs peer-focus:text-btn-add"
              >
                Nom du thème
              </label>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-btn-add to-btn-choix transform scale-x-0 peer-focus:scale-x-100 transition-transform duration-300"></div>
            </div>
          </div>

          {/* Upload d'image avec design moderne */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-prim">
              <FontAwesomeIcon icon={faImage} className="mr-2 text-btn-add" />
              Image du thème
            </label>
            
            <div className="relative group">
              <input
                type="file"
                id="theme-image"
                aria-label='choisir une image'
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-btn-add/50 group-hover:bg-white/5 transition-all duration-300">
                <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-btn-add mb-2" />
                <p className="text-sm text-text-second">
                  Cliquez pour choisir une image
                </p>
              </div>
            </div>
            
            {/* Preview avec design moderne */}
            {imagePreview && (
              <div className="relative group overflow-hidden rounded-xl border border-white/20">
                <Image
                  src={imagePreview}
                  alt="Aperçu"
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-2 left-2 bg-btn-add/90 text-white px-2 py-1 rounded-md text-xs font-medium">
                  Aperçu
                </div>
              </div>
            )}
          </div>

          {/* Message d'erreur avec style moderne */}
          {error && (
            <div className="relative p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="absolute inset-0 bg-red-500/5 rounded-xl"></div>
              <p className="relative text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Boutons avec design futuriste */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/20 text-text-prim rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-btn-add to-btn-choix text-white rounded-xl hover:shadow-lg hover:shadow-btn-add/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
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

        {/* Effet de bordure lumineuse */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-btn-add/10 via-transparent to-btn-choix/10 pointer-events-none"></div>
      </div>
    </div>
  )
}

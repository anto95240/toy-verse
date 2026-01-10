'use client'

import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUpload, faImage } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import { useToast } from '@/context/ToastContext' // IMPORT

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
  const { showToast } = useToast() // HOOK
  const isEditing = !!themeToEdit

  // ... (useEffect et handleImageChange restent identiques) ...
  useEffect(() => {
    async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath
      const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
      const { data, error } = await supabase.storage.from('toys-images').createSignedUrl(fullPath, 3600)
      if (error) { console.error('Erreur URL:', error); return null }
      return data.signedUrl
    }

    async function setupForm() {
      if (themeToEdit) {
        setName(themeToEdit.name)
        if (themeToEdit.image_url) {
            const signedUrl = await getSignedImageUrl(themeToEdit.image_url)
            setImagePreview(signedUrl)
        } else { setImagePreview(null) }
      } else {
        setName(''); setImagePreview(null)
      }
      setImageFile(null); setError('')
    }
    if (isOpen) setupForm()
  }, [isOpen, themeToEdit, supabase])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setImagePreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Le nom du thème est requis')

    setLoading(true)
    setError('')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        showToast('Vous devez être connecté', 'error')
        setLoading(false)
        return
      }

      let imagePath = themeToEdit?.image_url || null
      if (imageFile) {
        const { convertToWebP, generateImagePath } = await import('@/utils/imageConverter')
        const webpFile = await convertToWebP(imageFile)
        const fileName = generateImagePath(session.user.id, 'themes')
        
        const { error: uploadError } = await supabase.storage.from('toys-images').upload(fileName, webpFile)
        if (uploadError) {
          setError('Erreur upload: ' + uploadError.message)
          setLoading(false)
          return
        }
        imagePath = fileName
      }

      if (isEditing && themeToEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('themes') as any)
          .update({ name: name.trim(), image_url: imagePath })
          .eq('id', themeToEdit.id)
          .eq('user_id', session.user.id)
          .select()
          .single()

        if (error) throw error

        onUpdateTheme(data)
        showToast("Thème modifié avec succès !", "success") // TOAST SUCCESS
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('themes') as any)
          .insert({ name: name.trim(), image_url: imagePath, user_id: session.user.id })
          .select()
          .single()

        if (error) throw error

        onAddTheme(data)
        showToast("Nouveau thème créé !", "success") // TOAST SUCCESS
      }

      setName('')
      setImageFile(null)
      setImagePreview(null)
      onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message || 'Une erreur est survenue')
      showToast("Une erreur est survenue lors de l'enregistrement", "error")
    } finally {
      setLoading(false)
    }
  }

  // ... (handleClose et le JSX restent identiques) ...
  function handleClose() {
    if (!loading) { setName(''); setImageFile(null); setImagePreview(null); setError(''); onClose() }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center pt-20 z-50 p-4">
      {/* ... CONTENU MODAL IDENTIQUE AU FICHIER ORIGINAL ... */}
      <div className="relative bg-gradient-to-br from-bg-second via-bg-second to-bg-primary rounded-2xl border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-btn-add/20 to-btn-choix/20 rounded-t-2xl"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text text-transparent">
              {isEditing ? 'Modifier le thème' : 'Créer un thème'}
            </h2>
            <button aria-label='ferme la popup' onClick={handleClose} disabled={loading} className="group p-2 rounded-full bg-white/5 hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50">
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5 text-text-prim group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative group">
             <div className="relative">
              <input type="text" id="theme-name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} className="peer w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 pt-6 pb-3 text-text-prim placeholder-transparent focus:outline-none focus:border-btn-add/50 focus:bg-white/10 transition-all duration-300 disabled:opacity-50" placeholder="Nom du thème" />
              <label htmlFor="theme-name" className="absolute left-4 top-2 text-btn-add text-xs font-medium transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-text-second peer-focus:top-2 peer-focus:text-xs peer-focus:text-btn-add">Nom du thème</label>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-prim"><FontAwesomeIcon icon={faImage} className="mr-2 text-btn-add" />Image du thème</label>
            <div className="relative group">
              <input aria-label="selection d'une image" type="file" accept="image/*" onChange={handleImageChange} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-btn-add/50 group-hover:bg-white/5 transition-all duration-300">
                <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-btn-add mb-2" />
                <p className="text-sm text-text-second">Cliquez pour choisir une image</p>
              </div>
            </div>
            {imagePreview && (
              <div className="relative group overflow-hidden rounded-xl border border-white/20">
                <Image src={imagePreview} alt="Aperçu" width={400} height={160} className="w-full h-40 object-cover" />
              </div>
            )}
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} disabled={loading} className="flex-1 px-6 py-3 bg-white/5 border border-white/20 text-text-prim rounded-xl hover:bg-white/10 transition-all">Annuler</button>
            <button type="submit" disabled={loading || !name.trim()} className="flex-1 px-6 py-3 bg-gradient-to-r from-btn-add to-btn-choix text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div> : (isEditing ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
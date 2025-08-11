// components/ThemeModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'

type Props = {
  isOpen: boolean
  onClose: () => void
  onAddTheme: (theme: Theme) => void
  onUpdateTheme: (theme: Theme) => void
  themeToEdit: Theme | null
}

export default function ThemeModal({ isOpen, onClose, onAddTheme, onUpdateTheme, themeToEdit }: Props) {
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  // Fonction pour obtenir l'URL publique d'une image
  function getImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    
    const { data } = supabase.storage.from('toys-images').getPublicUrl(imagePath)
    return data.publicUrl
  }

  useEffect(() => {
    if (themeToEdit) {
      setName(themeToEdit.name)
      if (themeToEdit.image_url) {
        setPreviewUrl(getImageUrl(themeToEdit.image_url))
      } else {
        setPreviewUrl(null)
      }
    } else {
      setName('')
      setImageFile(null)
      setPreviewUrl(null)
    }
  }, [themeToEdit, isOpen, supabase])

  useEffect(() => {
    return () => {
      if (previewUrl && imageFile && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl, imageFile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      alert('Le nom du thème est requis')
      return
    }
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) throw new Error('Utilisateur non connecté')

      let image_url = themeToEdit?.image_url || null

      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}_${imageFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('toys-images')
          .upload(fileName, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        image_url = fileName
      }

      if (themeToEdit) {
        const { error } = await supabase
          .from('themes')
          .update({ name, image_url })
          .eq('id', themeToEdit.id)
          .eq('user_id', user.id)
        if (error) throw error
        onUpdateTheme({ ...themeToEdit, name, image_url })
      } else {
        const { data, error } = await supabase
          .from('themes')
          .insert([{ name, user_id: user.id, image_url }])
          .select()
          .single()
        if (error) throw error
        onAddTheme(data)
      }
      
      // Reset form
      setName('')
      setImageFile(null)
      setPreviewUrl(null)
      onClose()
    } catch (err: any) {
      console.error('Erreur modal:', err)
      alert('Erreur : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {themeToEdit ? 'Modifier' : 'Ajouter'} un thème
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          <div>
            <label htmlFor="theme-name" className="block text-sm font-medium mb-1">
              Nom du thème *
            </label>
            <input
              id="theme-name"
              type="text"
              placeholder="Ex: LEGO Star Wars"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="theme-image" className="block text-sm font-medium mb-1">
              Image du thème
            </label>
            <input
              id="theme-image"
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setImageFile(file)
                if (file) {
                  setPreviewUrl(URL.createObjectURL(file))
                } else if (themeToEdit?.image_url) {
                  setPreviewUrl(getImageUrl(themeToEdit.image_url))
                } else {
                  setPreviewUrl(null)
                }
              }}
              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Aperçu de l'image"
                className="max-h-48 max-w-full object-contain rounded-md border"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'En cours...' : themeToEdit ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
          />
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'En cours...' : themeToEdit ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  )
}

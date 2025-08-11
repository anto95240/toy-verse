// components/ThemeModal.tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
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

  useEffect(() => {
    if (themeToEdit) {
      setName(themeToEdit.name)
      if (themeToEdit.image_url) {
        setPreviewUrl(supabase.storage.from('toys-images').getPublicUrl(themeToEdit.image_url).data.publicUrl)
      } else {
        setPreviewUrl(null)
      }
    } else {
      setName('')
      setImageFile(null)
      setPreviewUrl(null)
    }
  }, [themeToEdit, isOpen])

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
        const { error: uploadError } = await supabase.storage.from('toys-images').upload(fileName, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        image_url = fileName
      }

      if (themeToEdit) {
        const { error } = await supabase
          .from('themes')
          .update({ name, image_url })
          .eq('id', themeToEdit.id)
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
      onClose()
    } catch (err: any) {
      alert('Erreur : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      tabIndex={0}
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
      onKeyDown={e => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg max-w-sm w-full flex flex-col gap-4"
      >
        <h2 className="text-xl font-semibold">{themeToEdit ? 'Modifier' : 'Ajouter'} un thème</h2>

        <input
          type="text"
          placeholder="Nom du thème"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border border-gray-400 p-2 rounded"
          required
          disabled={loading}
        />

        <input
          type="file"
          accept="image/*"
          aria-label="choisir une image"
          onChange={e => {
            const file = e.target.files?.[0] || null
            setImageFile(file)
            if (file) {
              setPreviewUrl(URL.createObjectURL(file))
            } else if (themeToEdit?.image_url) {
              setPreviewUrl(
                supabase.storage.from('toys-images').getPublicUrl(themeToEdit.image_url).data.publicUrl
              )
            } else {
              setPreviewUrl(null)
            }
          }}
          className="border border-gray-400 p-2 rounded"
          disabled={loading}
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Aperçu de l'image"
            className="max-h-40 object-contain rounded"
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

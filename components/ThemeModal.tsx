'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type ThemeModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddTheme: (theme: { id: number, name: string, image_url: string | null }) => void
}

export default function ThemeModal({ isOpen, onClose, onAddTheme }: ThemeModalProps) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  if (!isOpen) return null

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `themes/${fileName}`

    const { error } = await supabase.storage.from('toys-images').upload(filePath, file)

    if (error) {
      alert('Erreur lors de l’upload de l’image : ' + error.message)
      return null
    }

    const { data } = supabase.storage.from('toys-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return alert("Le nom est requis")

    setUploading(true)

    let imageUrl: string | null = null
    if (file) {
      imageUrl = await uploadImage(file)
      if (!imageUrl) {
        setUploading(false)
        return
      }
    }

    // Insertion dans Supabase
    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
      alert("Utilisateur non connecté")
      setUploading(false)
      return
    }

    const { data, error } = await supabase
      .from('themes')
      .insert([{ user_id: user.id, name: name.trim(), image_url: imageUrl }])
      .select()
      .single()

    if (error) {
      alert("Erreur lors de l'ajout : " + error.message)
      setUploading(false)
      return
    }

    onAddTheme(data)
    setName('')
    setFile(null)
    setUploading(false)
    onClose()
  }

  return (
    <>
      {/* Fond sombre */}
      <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      {/* Modal */}
      <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-md shadow-lg p-4">
        <h2 className="text-lg font-bold mb-2">Ajouter un thème</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom du thème"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={uploading}
            >
              {uploading ? 'Chargement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

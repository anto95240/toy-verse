"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faImage } from '@fortawesome/free-solid-svg-icons'
import { FormInput } from '@/components/ui/FormInput'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'

interface ThemeFormProps {
  initialName: string
  initialImageUrl: string | null
  onSubmit: (name: string, file: File | null) => Promise<void>
  onCancel: () => void
  loading: boolean
  isEditing: boolean
}

export default function ThemeForm({ initialName, initialImageUrl, onSubmit, onCancel, loading, isEditing }: ThemeFormProps) {
  const [name, setName] = useState(initialName)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  // Gestion initialisation et preview image
  useEffect(() => {
    setName(initialName)
    if (initialImageUrl) {
        if (initialImageUrl.startsWith('http')) setPreview(initialImageUrl)
        else supabase.storage.from('toys-images').createSignedUrl(initialImageUrl, 3600).then(({ data }) => setPreview(data?.signedUrl || null))
    } else {
        setPreview(null)
    }
    setImageFile(null)
  }, [initialName, initialImageUrl, supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name, imageFile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput id="theme-name" label="Nom du thème" value={name} onChange={setName} disabled={loading} required />

      <div className="space-y-4">
        <label className="block text-sm font-medium text-text-prim"><FontAwesomeIcon icon={faImage} className="mr-2 text-btn-add" />Image</label>
        <div className="relative group border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-btn-add/50 transition-all cursor-pointer bg-white/5">
          <input type="file" accept="image/*" aria-label="choix d'une image" onChange={handleImageChange} disabled={loading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <FontAwesomeIcon icon={faUpload} className="w-8 h-8 text-btn-add mb-2" />
          <p className="text-sm text-text-second">Cliquez pour choisir une image</p>
        </div>
        {preview && (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/20">
             <Image src={preview} alt="Aperçu" fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={loading} className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 text-text-prim">Annuler</button>
        <button type="submit" disabled={loading || !name.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-btn-add to-btn-choix text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-bold">
          {loading ? "Chargement..." : (isEditing ? 'Modifier' : 'Créer')}
        </button>
      </div>
    </form>
  )
}
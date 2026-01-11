import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import type { Toy } from '@/types/theme'

export function useToyModal(
  isOpen: boolean,
  onClose: () => void,
  themeId: string,
  userId: string,
  onSave: (toy: Toy) => void,
  toy: Toy | null
) {
  const supabase = getSupabaseClient()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [showImagePopup, setShowImagePopup] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [form, setForm] = useState<Omit<Toy, 'id' | 'created_at'>>({
    theme_id: themeId, user_id: userId, nom: '', taille: '', nb_pieces: null,
    numero: '', is_exposed: false, is_soon: false, photo_url: null,
    categorie: '', studio: '', release_date: null,
  })

  // 1. Initialisation du formulaire
  useEffect(() => {
    if (!isOpen) return
    if (toy) {
      setForm({ ...toy, theme_id: themeId, user_id: userId }) // Spread pour copier toutes les props
      setFile(null)
      if (toy.photo_url) {
        if (toy.photo_url.startsWith('http')) setPreviewUrl(toy.photo_url)
        else supabase.storage.from('toys-images').createSignedUrl(toy.photo_url, 3600).then(({ data }) => setPreviewUrl(data?.signedUrl || null))
      } else setPreviewUrl(null)
    } else {
      setForm({ theme_id: themeId, user_id: userId, nom: '', taille: '', nb_pieces: null, numero: '', is_exposed: false, is_soon: false, photo_url: null, categorie: '', studio: '', release_date: null })
      setFile(null); setPreviewUrl(null)
    }
  }, [isOpen, toy, themeId, userId, supabase])

  // 2. Prévisualisation image locale
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // 3. Logique de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) return showToast('Nom requis', 'error')
    if (form.nb_pieces !== null && form.nb_pieces < 0) return showToast('Pièces invalides', 'error')

    // Cas Optimiste (Update sans image)
    if (toy && !file) {
      onSave({ ...toy, ...form, id: toy.id, created_at: toy.created_at })
      onClose(); showToast("Modifié (Optimiste)", "success")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('toys') as any).update(form).eq('id', toy.id)
      if (error) showToast("Erreur sauvegarde background", "error")
      return
    }

    setLoading(true)
    try {
      let photoUrl = form.photo_url
      if (file) {
        const path = `toys/${userId}/${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('toys-images').upload(path, file, { upsert: true })
        if (error) throw error
        photoUrl = path
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = supabase.from('toys') as any
      const { data, error } = toy
        ? await query.update({ ...form, photo_url: photoUrl }).eq('id', toy.id).select().single()
        : await query.insert([{ ...form, photo_url: photoUrl }]).select().single()

      if (error) throw error
      onSave(data)
      showToast(toy ? "Jouet modifié" : "Jouet créé", "success")
      onClose()
    } catch (err: any) {
      showToast(err.message || "Erreur", "error")
    } finally {
      setLoading(false)
    }
  }

  return {
    form, setForm,
    file, setFile,
    previewUrl, setPreviewUrl,
    loading,
    showImagePopup, setShowImagePopup,
    handleSubmit
  }
}
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'

function buildStoragePath(photoUrl: string, userId?: string): string {
  if (!photoUrl) return ''

  let cleanPath = photoUrl.replace(/^\/+/, '')

  // Si le chemin commence déjà par toys-images, on le retourne tel quel
  if (cleanPath.startsWith('toys-images/')) {
    return cleanPath
  }

  // Si le chemin utilise l'ancienne structure, on le convertit
  if (cleanPath.startsWith('toys/') || cleanPath.startsWith('theme/')) {
    return cleanPath
  }

  if (!userId) {
    return cleanPath
  }

  // Nouvelle structure avec userId
  if (cleanPath.includes('theme') || cleanPath.includes('Theme')) {
    return `toys-images/theme/${userId}/${cleanPath}`
  } else {
    return `toys-images/toy/${userId}/${cleanPath}`
  }
}

export function useToyImages(toys: Toy[], currentUserId?: string) {
  const [toyImageUrls, setToyImageUrls] = useState<Record<string, string | null>>({})
  const supabase = getSupabaseClient()

  async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath

    const storagePath = buildStoragePath(imagePath, currentUserId)

    const { data, error } = await supabase.storage
      .from('toys-images')
      .createSignedUrl(storagePath, 3600)

    if (error) {
      return null
    }

    return data.signedUrl
  }

  useEffect(() => {
    async function loadToyImages() {
      const urls: Record<string, string | null> = {}
      
      for (const toy of toys) {
        if (toy.photo_url) {
          urls[toy.id] = await getSignedImageUrl(toy.photo_url)
        } else {
          urls[toy.id] = null
        }
      }
      
      setToyImageUrls(urls)
    }

    if (toys.length > 0 && currentUserId) {
      loadToyImages()
    } else {
      setToyImageUrls({})
    }
  }, [toys.map(t => `${t.id}-${t.photo_url}`).join(','), currentUserId])

  const updateToyImageUrl = async (toyId: string, photoUrl: string | null) => {
    const signedUrl = await getSignedImageUrl(photoUrl)
    setToyImageUrls(prev => ({ ...prev, [toyId]: signedUrl }))
  }

  const removeToyImageUrl = (toyId: string) => {
    setToyImageUrls(prev => {
      const copy = { ...prev }
      delete copy[toyId]
      return copy
    })
  }

  return {
    toyImageUrls,
    updateToyImageUrl,
    removeToyImageUrl
  }
}
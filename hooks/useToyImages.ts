import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'

export function useToyImages(toys: Toy[]) {
  const [toyImageUrls, setToyImageUrls] = useState<Record<string, string | null>>({})
  const supabase = getSupabaseClient()

  // Fonction pour récupérer une URL signée pour une image stockée dans Supabase Storage
  async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath

    const fullPath = imagePath.startsWith('toys/') ? imagePath : `toys/${imagePath}`
    const { data, error } = await supabase.storage
      .from('toys-images')
      .createSignedUrl(fullPath, 3600)

    if (error) {
      console.error('Erreur création URL signée:', error)
      return null
    }
    return data.signedUrl
  }

  // Charger URLs signées des images à chaque changement de liste de jouets
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
    if (toys.length > 0) loadToyImages()
    else setToyImageUrls({})
  }, [toys])

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
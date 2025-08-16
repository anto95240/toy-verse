// utils/imageUtils.ts
import { getSupabaseClient } from "@/utils/supabase/client"

interface ImageCache {
  [toyId: string]: {
    url: string
    timestamp: number
  }
}

// Cache des URLs d'images avec timestamp
const imageCache: ImageCache = {}
const CACHE_DURATION = 3 * 60 * 60 * 1000 // 3 heures en millisecondes

export async function getToyImageUrl(toyId: string, imagePath?: string): Promise<string | null> {
  if (!imagePath) return null
  
  const supabase = getSupabaseClient()
  const now = Date.now()
  
  // Vérifier le cache
  if (imageCache[toyId] && (now - imageCache[toyId].timestamp) < CACHE_DURATION) {
    return imageCache[toyId].url
  }
  
  try {
    // Générer une nouvelle URL signée
    const { data, error } = await supabase.storage
      .from('toys-images')
      .createSignedUrl(imagePath, 3600) // 1 heure d'expiration
    
    if (error) {
      console.error(`Erreur lors de la génération de l'URL signée pour ${toyId}:`, error)
      return null
    }
    
    if (!data?.signedUrl) {
      console.warn(`Pas d'URL signée générée pour ${toyId}`)
      return null
    }
    
    // Mettre en cache
    imageCache[toyId] = {
      url: data.signedUrl,
      timestamp: now
    }
    
    return data.signedUrl
    
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'image pour ${toyId}:`, error)
    return null
  }
}

export async function getToyImageUrls(toys: Array<{ id: string, photo_url?: string }>): Promise<Record<string, string | null>> {
  const imageUrls: Record<string, string | null> = {}
  
  // Traiter les images en parallèle avec une limite
  const BATCH_SIZE = 5
  for (let i = 0; i < toys.length; i += BATCH_SIZE) {
    const batch = toys.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(async (toy) => {
      const url = await getToyImageUrl(toy.id, toy.photo_url)
      return { id: toy.id, url }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ id, url }) => {
      imageUrls[id] = url
    })
  }
  
  return imageUrls
}

// Fonction pour nettoyer le cache périodiquement
export function clearExpiredImageCache() {
  const now = Date.now()
  Object.keys(imageCache).forEach(toyId => {
    if ((now - imageCache[toyId].timestamp) > CACHE_DURATION) {
      delete imageCache[toyId]
    }
  })
}
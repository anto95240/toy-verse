import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'

// 🔧 Fonction pour construire le bon chemin selon la structure /toys-images/toys/[userId]
function buildStoragePath(photoUrl: string, userId?: string): string {
  if (!photoUrl) {
    console.warn('⚠️ buildStoragePath: photoUrl manquant')
    return ''
  }

  // Nettoyer le chemin de départ
  let cleanPath = photoUrl.replace(/^\/+/, '')
  
  console.log('🔧 useToyImages buildStoragePath - Input:', { photoUrl, userId, cleanPath })

  // Vérifier si le chemin contient déjà la structure complète avec prefixe toys/ ou theme/
  if (cleanPath.startsWith('toys/') || cleanPath.startsWith('theme/')) {
    console.log('✅ Chemin déjà complet avec préfixe:', cleanPath)
    return cleanPath
  }

  // Vérifier s'il y a déjà un userId quelconque dans le chemin
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i
  const startsWithUuid = uuidRegex.test(cleanPath)
  
  if (startsWithUuid) {
    // Le chemin commence par un UUID, c'est probablement toys/[userId]/filename
    const finalPath = `toys/${cleanPath}`
    console.log('🎯 Hook - Chemin avec UUID détecté, ajout préfixe toys:', finalPath)
    return finalPath
  }

  // Si pas d'userId fourni, essayer de deviner
  if (!userId) {
    console.log('⚠️ Pas d\'userId fourni, utilisation du chemin tel quel:', cleanPath)
    return cleanPath
  }

  // Construire le chemin selon la structure attendue
  if (cleanPath.includes('theme') || cleanPath.includes('Theme')) {
    const finalPath = `theme/${userId}/${cleanPath}`
    console.log('🎨 Hook - Chemin theme construit:', finalPath)
    return finalPath
  } else {
    // Par défaut, considérer comme un jouet
    const finalPath = `toys/${userId}/${cleanPath}`
    console.log('🔄 Hook - Chemin toys par défaut construit:', finalPath)
    return finalPath
  }
}

export function useToyImages(toys: Toy[], currentUserId?: string) {
  const [toyImageUrls, setToyImageUrls] = useState<Record<string, string | null>>({})
  const supabase = getSupabaseClient()

  // Fonction pour récupérer une URL signée pour une image stockée dans Supabase Storage
  async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath

    // 🔧 Utiliser buildStoragePath pour construire le chemin correct
    const storagePath = buildStoragePath(imagePath, currentUserId)
    console.log('🗂️ Hook - Chemin storage final:', storagePath)

    const { data, error } = await supabase.storage
      .from('toys-images')
      .createSignedUrl(storagePath, 3600)

    if (error) {
      console.error('❌ Erreur création URL signée:', error)
      console.error('   Path utilisé:', storagePath)
      return null
    }

    console.log('✅ URL signée générée via hook pour:', storagePath)
    return data.signedUrl
  }

  // Charger URLs signées des images à chaque changement de liste de jouets
  useEffect(() => {
    async function loadToyImages() {
      const urls: Record<string, string | null> = {}
      
      console.log('🚀 Hook - Chargement images pour', toys.length, 'jouets')
      
      for (const toy of toys) {
        if (toy.photo_url) {
          console.log('📸 Hook - Traitement image pour:', toy.nom, 'path:', toy.photo_url)
          urls[toy.id] = await getSignedImageUrl(toy.photo_url)
        } else {
          urls[toy.id] = null
        }
      }
      
      console.log('✅ Hook - URLs générées:', Object.keys(urls).length)
      setToyImageUrls(urls)
    }

    if (toys.length > 0 && currentUserId) {
      loadToyImages()
    } else {
      setToyImageUrls({})
    }
  }, [toys.map(t => `${t.id}-${t.photo_url}`).join(','), currentUserId])

  const updateToyImageUrl = async (toyId: string, photoUrl: string | null) => {
    console.log('🔄 Hook - Mise à jour image pour:', toyId, 'path:', photoUrl)
    const signedUrl = await getSignedImageUrl(photoUrl)
    setToyImageUrls(prev => ({ ...prev, [toyId]: signedUrl }))
  }

  const removeToyImageUrl = (toyId: string) => {
    console.log('🗑️ Hook - Suppression image pour:', toyId)
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
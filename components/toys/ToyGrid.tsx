"use client"

import React, { useState, useEffect, useCallback } from "react"
import type { Toy } from "@/types/theme"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash, faArrowLeft, faImage } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/utils/supabase/type';

interface ToyGridProps {
  toys: Toy[]
  toyImageUrls: Record<string, string | null>
  onEditToy: (toy: Toy) => void
  onDeleteToy: (toyId: string) => void
  searchResults?: (Toy & { theme_name: string })[]
  isSearchActive?: boolean
  onClearSearch?: () => void
  currentThemeName?: string
  currentUserId?: string
}

// 🔥 Hook global pour gérer les URLs signées avec cache persistant
const signedUrlsCache = new Map<string, { url: string; expires: number }>()
const pendingRequests = new Map<string, Promise<string | null>>()

// 🛠️ Fonction corrigée pour construire le bon chemin selon la structure /toys-images/toys/[userId]
function buildStoragePath(photoUrl: string, userId?: string): string {
  if (!photoUrl) {
    console.warn('⚠️ buildStoragePath: photoUrl manquant')
    return ''
  }

  // Nettoyer le chemin de départ
  let cleanPath = photoUrl.replace(/^\/+/, '')
  
  console.log('🔧 buildStoragePath - Input:', { photoUrl, userId, cleanPath })

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
    console.log('🎯 Chemin avec UUID détecté, ajout préfixe toys:', finalPath)
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
    console.log('🎨 Chemin theme construit:', finalPath)
    return finalPath
  } else {
    // Par défaut, considérer comme un jouet
    const finalPath = `toys/${userId}/${cleanPath}`
    console.log('🔄 Chemin toys par défaut construit:', finalPath)
    return finalPath
  }
}

function useSignedUrl(toy: Toy, toyImageUrls: Record<string, string | null>, currentUserId?: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const generateSignedUrl = useCallback(async (toy: Toy): Promise<string | null> => {
    const cacheKey = `${toy.id}-${toy.photo_url}-${currentUserId}`

    const cached = signedUrlsCache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      console.log('📋 Cache hit pour:', toy.nom)
      return cached.url
    }

    if (pendingRequests.has(cacheKey)) {
      console.log('⏳ Requête en cours pour:', toy.nom)
      return await pendingRequests.get(cacheKey)!
    }

    if (!toy.photo_url) {
      console.log('❌ Pas de photo_url pour:', toy.nom)
      return null
    }

    if (toy.photo_url.startsWith('http')) {
      console.log('🌐 URL externe pour:', toy.nom)
      return toy.photo_url
    }

    // 🔧 Utiliser buildStoragePath corrigé
    const storagePath = buildStoragePath(toy.photo_url, currentUserId)
    console.log('🗂️ Chemin storage final pour', toy.nom, ':', storagePath)

    const promise = (async () => {
      try {
        console.log('🚀 Génération URL signée pour:', storagePath)
        const { data, error } = await supabase.storage
          .from('toys-images')
          .createSignedUrl(storagePath, 7200)

        if (error) {
          console.error(`❌ Erreur Supabase pour ${toy.nom}:`, error)
          console.error('   Path utilisé:', storagePath)
          return null
        }

        if (data?.signedUrl) {
          console.log('✅ URL signée générée pour:', toy.nom)
          signedUrlsCache.set(cacheKey, {
            url: data.signedUrl,
            expires: Date.now() + 7200 * 1000 - 60 * 1000,
          })
          return data.signedUrl
        }
        
        console.warn('⚠️ Pas d\'URL signée retournée pour:', toy.nom)
        return null
      } catch (err) {
        console.error('🚨 Exception lors de la génération URL signée:', err)
        return null
      } finally {
        pendingRequests.delete(cacheKey)
      }
    })()

    pendingRequests.set(cacheKey, promise)
    return await promise
  }, [supabase, currentUserId])

  useEffect(() => {
    let isMounted = true

    const loadImage = async () => {
      // Reset des états
      setHasError(false)
      setIsLoading(true)

      try {
        // 1. Vérifier le cache principal (thème actuel)
        if (toyImageUrls[toy.id]) {
          console.log(`🎯 Cache principal pour ${toy.nom}`)
          if (isMounted) {
            setImageUrl(toyImageUrls[toy.id])
            setIsLoading(false)
          }
          return
        }

        // 2. Générer URL signée pour autres thèmes
        const signedUrl = await generateSignedUrl(toy)
        
        if (isMounted) {
          setImageUrl(signedUrl)
          setIsLoading(false)
          if (!signedUrl) {
            setHasError(true)
          }
        }
      } catch (error) {
        console.error(`🚨 Erreur chargement ${toy.nom}:`, error)
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [toy.id, toy.photo_url, toyImageUrls, generateSignedUrl, currentUserId])

  return { imageUrl, isLoading, hasError }
}

// Composant Image optimisé
function ToyImage({ 
  toy, 
  toyImageUrls,
  currentUserId 
}: { 
  toy: Toy
  toyImageUrls: Record<string, string | null>
  currentUserId?: string
}) {
  const { imageUrl, isLoading, hasError } = useSignedUrl(toy, toyImageUrls, currentUserId)

  if (isLoading) {
    return (
      <div className="w-48 h-48 bg-gray-100 flex flex-col items-center justify-center border rounded animate-pulse">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div className="text-gray-500 text-xs">Chargement...</div>
      </div>
    )
  }

  if (hasError || !imageUrl) {
    return (
      <div className="w-48 h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-400 border rounded">
        <FontAwesomeIcon icon={faImage} className="text-2xl mb-2" />
        <span className="text-xs text-center px-2">
          {hasError ? "Image non trouvée" : "Pas d'image"}
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-48 h-48">
      <Image
        src={imageUrl}
        alt={toy.nom}
        fill
        className="object-contain"
        unoptimized
        onError={(e) => {
          console.error(`💥 Erreur rendu image ${toy.nom}:`, imageUrl)
          // Remplacer par placeholder en cas d'erreur de rendu
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          if (target.parentElement) {
            target.parentElement.innerHTML = `
              <div class="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-400 border rounded">
                <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-xs">Erreur</span>
              </div>
            `
          }
        }}
      />
    </div>
  )
}

export default function ToyGrid({ 
  toys, 
  toyImageUrls, 
  onEditToy, 
  onDeleteToy,
  searchResults,
  isSearchActive = false,
  onClearSearch,
  currentThemeName,
  currentUserId
}: ToyGridProps) {
  // 🔍 Détermine quels jouets afficher
  const toysToDisplay = isSearchActive && searchResults ? searchResults : toys
  
  // 🎯 Vérifie si on affiche un jouet spécifique d'un autre thème
  const isShowingSpecificToy = isSearchActive && searchResults && searchResults.length === 1
  const specificToy = isShowingSpecificToy ? searchResults[0] : null
  const isFromDifferentTheme = specificToy && currentThemeName && specificToy.theme_name !== currentThemeName

  if (toysToDisplay.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          {isSearchActive ? "Aucun jouet trouvé pour cette recherche." : "Aucun jouet trouvé pour ces critères."}
        </p>
        {isSearchActive && onClearSearch && (
          <button 
            onClick={onClearSearch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Afficher tous les jouets
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* 🎯 Bannière pour jouet spécifique d'un autre thème */}
      {isFromDifferentTheme && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-blue-900">
                  Jouet du thème &quot;{specificToy.theme_name}&quot;
                </p>
                <p className="text-sm text-blue-700">
                  Vous visualisez un jouet spécifique. Réinitialisez les filtres pour voir tous les jouets du thème actuel.
                </p>
              </div>
            </div>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                Voir tous les jouets
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🧸 Grille des jouets */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-11 gap-y-12">
        {toysToDisplay.map(toy => (
          <li key={toy.id} className={`flex flex-row rounded-xl h-72 md:h-72 toy-card-mobile ${
            isFromDifferentTheme ? 'ring-2 ring-blue-300 shadow-lg' : ''
          }`}>
            {/* Image + boutons */}
            <div className="flex flex-col items-center border rounded-s-lg lg:rounded-lg justify-between p-2">
              {/* Image avec URLs signées */}
              <ToyImage toy={toy} toyImageUrls={toyImageUrls} currentUserId={currentUserId} />
              
              <div className="flex gap-4 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditToy(toy)
                  }}
                  className="text-lg text-green-600 hover:text-green-700 transition-colors"
                  title="Modifier ce jouet"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteToy(toy.id)
                  }}
                  className="text-lg text-red-600 hover:text-red-700 transition-colors"
                  title="Supprimer ce jouet"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            {/* Infos */}
            <div className="bg-baground-detail border my-auto rounded-r-lg border-black p-4 flex-1 lg:h-4/5 shadow-lg">
              <h3 className="font-semibold text-lg text-center mb-3">{toy.nom}</h3>
              <div className="flex flex-col items-start gap-1">
                <p className="text-sm text-text-second">Numéro : {toy.numero || "—"}</p>
                <p className="text-sm text-text-second">Pièces : {toy.nb_pieces || "—"}</p>
                <p className="text-sm text-text-second">Taille : {toy.taille || "—"}</p>
                <p className="text-sm text-text-second">Catégorie : {toy.categorie || "—"}</p>
                
                {/* 🎨 Affichage du thème pour jouets d'autres thèmes */}
                {isFromDifferentTheme && 'theme_name' in toy && (
                  <p className="text-sm font-medium text-blue-600">
                    Thème : {(toy as Toy & { theme_name: string }).theme_name}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {toy.is_exposed && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      Exposé
                    </span>
                  )}
                  {toy.is_soon && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      Bientôt
                    </span>
                  )}
                  {isFromDifferentTheme && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Autre thème
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
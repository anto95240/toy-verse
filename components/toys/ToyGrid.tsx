"use client"

import React, { useState, useEffect } from "react"
import type { Toy } from "@/types/theme"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash, faArrowLeft, faImage } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { getToyImageUrl } from "@/utils/imageUtils" // Import de votre utilitaire

interface ToyGridProps {
  toys: Toy[]
  toyImageUrls: Record<string, string | null>
  onEditToy: (toy: Toy) => void
  onDeleteToy: (toyId: string) => void
  searchResults?: (Toy & { theme_name: string })[]
  isSearchActive?: boolean
  onClearSearch?: () => void
  currentThemeName?: string
}

// Composant pour l'image avec gestion d'erreur
function ToyImage({ toy, initialUrl }: { toy: Toy, initialUrl: string | null }) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  // Fonction pour recharger l'image
  const reloadImage = async () => {
    if (!toy.photo_url) return
    
    setIsLoading(true)
    setHasError(false)
    
    try {
      const newUrl = await getToyImageUrl(toy.id, toy.photo_url)
      setImageUrl(newUrl)
    } catch (error) {
      console.error("Erreur lors du rechargement de l'image:", error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Gestionnaire d'erreur d'image
  const handleImageError = () => {
    console.warn(`Erreur de chargement d'image pour ${toy.nom}`)
    setHasError(true)
    // Essayer de recharger automatiquement
    reloadImage()
  }
  
  if (!imageUrl || hasError) {
    return (
      <div className="w-48 h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-400 border rounded">
        <FontAwesomeIcon icon={faImage} className="text-2xl mb-2" />
        <span className="text-xs text-center px-2">
          {isLoading ? "Chargement..." : hasError ? "Erreur image" : "Pas d'image"}
        </span>
        {hasError && toy.photo_url && (
          <button
            onClick={reloadImage}
            className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            disabled={isLoading}
          >
            {isLoading ? "..." : "Recharger"}
          </button>
        )}
      </div>
    )
  }
  
  return (
    <Image
      src={imageUrl}
      alt={toy.nom}
      width={192}
      height={192}
      className="w-48 h-48 object-contain"
      onError={handleImageError}
      unoptimized // Désactive l'optimisation Next.js pour les URLs signées
      priority={false}
    />
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
  currentThemeName
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
                  Jouet du thème "{specificToy.theme_name}"
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
              {toyImageUrls[toy.id] ? (
              <Image
                src={toyImageUrls[toy.id] as string}
                alt={toy.nom}
                width={100}
                height={40}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                Pas d&apos;image
              </div>
            )}
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
                <p className="text-sm text-text-second">Numéro : {toy.numero}</p>
                <p className="text-sm text-text-second">Pièces : {toy.nb_pieces}</p>
                <p className="text-sm text-text-second">Taille : {toy.taille}</p>
                <p className="text-sm text-text-second">Catégorie : {toy.categorie || "—"}</p>
                
                {/* 🎨 Affichage du thème pour jouets d'autres thèmes */}
                {isFromDifferentTheme && 'theme_name' in toy && (
                  <p className="text-sm font-medium text-blue-600">
                    Thème : {(toy as any).theme_name}
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
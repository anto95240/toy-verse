import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"
import { createSlug } from "@/lib/slugUtils"
import ToyImage from "./ToyImage"
import type { ToyCardProps } from "@/types/toyGrid"

export default function ToyCard({
  toy,
  toyImageUrls,
  currentUserId,
  onEditToy,
  onDeleteToy,
  isFromDifferentTheme = false
}: ToyCardProps) {
  const router = useRouter()

  const handleThemeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (toy.theme_name) {
      const themeSlug = createSlug(toy.theme_name.trim())
      router.push(`/${themeSlug}`)
    }
  }

  return (
    <li className="w-full">
      {/* Layout mobile - vertical */}
      <div className="flex flex-col sm:hidden bg-bg-second rounded-xl shadow-lg border overflow-hidden">
        <div className="flex justify-center p-4 bg-bg-second">
          <ToyImage toy={toy} toyImageUrls={toyImageUrls} currentUserId={currentUserId} />
        </div>
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg flex-1">{toy.nom}</h3>
            <div className="flex gap-2 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditToy(toy)
                }}
                className="text-green-600 hover:text-green-700 transition-colors p-1"
                title="Modifier ce jouet"
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteToy(toy.id)
                }}
                className="text-red-600 hover:text-red-700 transition-colors p-1"
                title="Supprimer ce jouet"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-text-second">Numéro : {toy.numero || "—"}</p>
            <p className="text-text-second">Pièces : {toy.nb_pieces || "—"}</p>
            <p className="text-text-second">Taille : {toy.taille || "—"}</p>
            <p className="text-text-second">Catégorie : {toy.categorie || "—"}</p>
            <p className="text-text-second col-span-2">Studio/License : {toy.studio || "—"}</p>
          </div>
          
          {isFromDifferentTheme && toy.theme_name && (
            <button
              onClick={handleThemeClick}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer mt-2 block"
              title={`Aller au thème ${toy.theme_name}`}
            >
              Thème: {toy.theme_name}
            </button>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
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
          </div>
        </div>
      </div>

      {/* Layout desktop - horizontal */}
      <div className="hidden sm:flex bg-bg-second rounded-xl shadow-lg border overflow-hidden h-72">
        <div className="flex flex-col items-center justify-between p-4 bg-bg-second min-w-[200px]">
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

        <div className="bg-background-detail p-4 flex-1 overflow-hidden">
          <h3 className="font-semibold text-lg text-center mb-3 truncate">{toy.nom}</h3>
          <div className="flex flex-col gap-1 overflow-y-auto max-h-40">
            <p className="text-sm text-text-second">Numéro : {toy.numero || "—"}</p>
            <p className="text-sm text-text-second">Pièces : {toy.nb_pieces || "—"}</p>
            <p className="text-sm text-text-second">Taille : {toy.taille || "—"}</p>
            <p className="text-sm text-text-second">Catégorie : {toy.categorie || "—"}</p>
            <p className="text-sm text-text-second">Studio/License : {toy.studio || "—"}</p>
                      
            {isFromDifferentTheme && toy.theme_name && (
              <button
                onClick={handleThemeClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer text-left"
                title={`Aller au thème ${toy.theme_name}`}
              >
                Thème: {toy.theme_name}
              </button>
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
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
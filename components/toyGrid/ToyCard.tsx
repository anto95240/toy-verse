import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
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
  return (
    <li className={`flex flex-row rounded-xl h-72 md:h-72 toy-card-mobile ${
      isFromDifferentTheme ? 'ring-2 ring-blue-300 shadow-lg' : ''
    }`}>
      <div className="flex flex-col items-center border rounded-s-lg lg:rounded-lg justify-between p-2">
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

      <div className="bg-baground-detail border my-auto rounded-r-lg border-black p-4 flex-1 lg:h-4/5 shadow-lg">
        <h3 className="font-semibold text-lg text-center mb-3">{toy.nom}</h3>
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm text-text-second">Numéro : {toy.numero || "—"}</p>
          <p className="text-sm text-text-second">Pièces : {toy.nb_pieces || "—"}</p>
          <p className="text-sm text-text-second">Taille : {toy.taille || "—"}</p>
          <p className="text-sm text-text-second">Catégorie : {toy.categorie || "—"}</p>
          
          {isFromDifferentTheme && toy.theme_name && (
            <p className="text-sm font-medium text-blue-600">
              Thème : {toy.theme_name}
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
  )
}
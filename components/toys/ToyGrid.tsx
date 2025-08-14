"use client"

import React from "react"
import type { Toy } from "@/types/theme"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import Image from 'next/image'

interface ToyGridProps {
  toys: Toy[]
  toyImageUrls: Record<string, string | null>
  onEditToy: (toy: Toy) => void
  onDeleteToy: (toyId: string) => void
}

export default function ToyGrid({ toys, toyImageUrls, onEditToy, onDeleteToy }: ToyGridProps) {
  if (toys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun jouet trouvé pour ces critères.</p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
      {toys.map(toy => (
        <li key={toy.id} className="flex flex-row rounded-xl h-72">
          {/* Image + boutons */}
          <div className="flex flex-col items-center border rounded-lg justify-between p-2">
            {toyImageUrls[toy.id] ? (
              <Image
                src={toyImageUrls[toy.id] as string}
                alt={toy.nom}
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                Pas d'image
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
          <div className="bg-baground-detail border my-auto rounded-r-lg border-black p-4 flex-1 h-4/5 shadow-lg">
            <h3 className="font-semibold text-lg text-center mb-3">{toy.nom}</h3>
            <div className="flex flex-col items-start gap-1">
              <p className="text-sm text-gray-600">Numéro : {toy.numero}</p>
              <p className="text-sm text-gray-600">Pièces : {toy.nb_pieces}</p>
              <p className="text-sm text-gray-600">Taille : {toy.taille}</p>
              <p className="text-sm text-gray-600">Catégorie : {toy.categorie || "—"}</p>

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
        </li>
      ))}
    </ul>
  )
}
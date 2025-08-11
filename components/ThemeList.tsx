'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

interface ThemesListProps {
  initialThemes: Theme[]
  userId: string
}

export default function ThemesList({ initialThemes, userId }: ThemesListProps) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  // Fonction pour obtenir l'URL publique d'une image
  function getImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    
    const { data } = supabase.storage.from('toys-images').getPublicUrl(imagePath)
    return data.publicUrl
  }
  async function handleDeleteTheme(themeId: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce thème ?")) return
    setIsLoading(true)
    const { error } = await supabase.from('themes').delete().eq('id', themeId)
    setIsLoading(false)

    if (error) {
      alert("Erreur suppression : " + error.message)
    } else {
      setThemes(prev => prev.filter(t => t.id !== themeId))
      alert("Thème supprimé avec succès.")
    }
  }

  return (
    <>
      {themes.length === 0 ? (
        <p className="text-center">Aucun thème ajouté</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {themes.map(({ id, name, image_url }) => (
            <li
              key={id}
              className="rounded-xl p-3 cursor-pointer hover:shadow-lg transition border border-black"
            >
              <div className="flex items-center gap-4">
                {getImageUrl(image_url) ? (
                  <img
                    src={getImageUrl(image_url)!}
                    alt={name}
                    className="w-full h-36 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-md flex items-center justify-center text-gray-600 flex-shrink-0">
                    Pas d’image
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center pt-2 justify-between">
                <span className="font-semibold mx-auto">{name}</span>
                <button
                  onClick={() => handleDeleteTheme(id)}
                  disabled={isLoading}
                  className="text-btn-delete hover:text-red-800 font-bold"
                  title="Supprimer thème"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

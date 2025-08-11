'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import ThemeModal from './ThemeModal'

interface ThemesListProps {
  initialThemes: Theme[]
  userId: string
}

export default function ThemesList({ initialThemes, userId }: ThemesListProps) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null)
  const supabase = getSupabaseClient()
  const router = useRouter()

  // Fonction pour obtenir l'URL publique d'une image
  function getImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    
    const { data } = supabase.storage.from('toys-images').getPublicUrl(imagePath)
    return data.publicUrl
  }

  function handleAddTheme(newTheme: Theme) {
    setThemes(prev => [newTheme, ...prev])
  }

  function handleUpdateTheme(updatedTheme: Theme) {
    setThemes(prev => prev.map(theme => 
      theme.id === updatedTheme.id ? updatedTheme : theme
    ))
  }

  function openEditModal(theme: Theme) {
    setThemeToEdit(theme)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setThemeToEdit(null)
  }

  function handleThemeClick(themeId: string) {
    router.push(`/theme/${themeId}`)
  }

  async function handleDeleteTheme(themeId: string) {
    if (isLoading) return
    if (!confirm("Voulez-vous vraiment supprimer ce thème ?")) return
    
    setIsLoading(true)
    
    try {
      const { error } = await supabase.from('themes').delete().eq('id', themeId)
      
      if (error) {
        alert("Erreur suppression : " + error.message)
      } else {
        setThemes(prev => prev.filter(t => t.id !== themeId))
        alert("Thème supprimé avec succès.")
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert("Une erreur est survenue lors de la suppression")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-btn-add text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Ajouter un thème
        </button>
      </div>

      {themes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun thème ajouté pour le moment</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-btn-add text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Créer votre premier thème
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {themes.map(({ id, name, image_url }) => (
            <li
              key={id}
              className="rounded-xl p-3 hover:shadow-lg transition-all border border-gray-200 bg-white w-full max-w-sm"
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleThemeClick(id)}
              >
                {getImageUrl(image_url) ? (
                  <img
                    src={getImageUrl(image_url)!}
                    alt={name}
                    className="w-full h-48 object-cover rounded-md"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                    Pas d’image
                  </div>
                )}
              </div>
              
              <div className="pt-3">
                <h3 className="font-semibold text-lg text-center mb-3">{name}</h3>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal({ id, name, image_url, user_id: userId })
                    }}
                    disabled={isLoading}
                    className="text-btn-edit hover:text-green-700 p-2 rounded transition-colors"
                    title="Modifier thème"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTheme(id)
                    }}
                    disabled={isLoading}
                    className="text-btn-delete hover:text-red-700 p-2 rounded transition-colors disabled:opacity-50"
                    title="Supprimer thème"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ThemeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddTheme={handleAddTheme}
        onUpdateTheme={handleUpdateTheme}
        themeToEdit={themeToEdit}
      />
    </>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import ThemeModal from './ThemeModal'
import Image from 'next/image'

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

  // État pour les URLs d'images
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({})

  // Charger les URLs signées pour toutes les images
  useEffect(() => {
    // Fonction pour obtenir l'URL publique d'une image depuis Supabase Storage
    async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath
      
      // Les images sont dans le dossier themes/ du bucket toys-images
      const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
      const { data, error } = await supabase.storage
        .from('toys-images')
        .createSignedUrl(fullPath, 3600) // 1 heure d'expiration
      
      if (error) {
        console.error('Erreur création URL signée:', error)
        return null
      }
      
      return data.signedUrl
    }

    async function loadImageUrls() {
      const urls: Record<string, string | null> = {}
      
      for (const theme of themes) {
        if (theme.image_url) {
          urls[theme.id] = await getSignedImageUrl(theme.image_url)
        }
      }
      
      setImageUrls(urls)
    }
    
    if (themes.length > 0) {
      loadImageUrls()
    }
  }, [themes, supabase])

  function handleAddTheme(newTheme: Theme) {
    setThemes(prev => [newTheme, ...prev])
    // Charger l'URL signée pour le nouveau thème
    if (newTheme.image_url) {
      // Recréer la fonction pour ce cas spécifique
      const getSignedUrl = async (imagePath: string) => {
        const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
        const { data, error } = await supabase.storage
          .from('toys-images')
          .createSignedUrl(fullPath, 3600)
        
        if (error) {
          console.error('Erreur création URL signée:', error)
          return null
        }
        return data.signedUrl
      }
      
      getSignedUrl(newTheme.image_url).then(url => {
        setImageUrls(prev => ({ ...prev, [newTheme.id]: url }))
      })
    }
  }

  function handleUpdateTheme(updatedTheme: Theme) {
    setThemes(prev => prev.map(theme => 
      theme.id === updatedTheme.id ? updatedTheme : theme
    ))
    // Recharger l'URL signée pour le thème mis à jour
    if (updatedTheme.image_url) {
      // Recréer la fonction pour ce cas spécifique
      const getSignedUrl = async (imagePath: string) => {
        const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
        const { data, error } = await supabase.storage
          .from('toys-images')
          .createSignedUrl(fullPath, 3600)
        
        if (error) {
          console.error('Erreur création URL signée:', error)
          return null
        }
        return data.signedUrl
      }
      
      getSignedUrl(updatedTheme.image_url).then(url => {
        setImageUrls(prev => ({ ...prev, [updatedTheme.id]: url }))
      })
    }
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
              className="rounded-xl p-3 shadow-shadow-detail transition-all border border-gray-200 bg-bg-second w-full max-w-sm"
            >
              <div 
                className="cursor-pointer"
                onClick={() => handleThemeClick(id)}
              >
                {imageUrls[id] ? (
                  <Image
                    src={imageUrls[id]!}
                    alt={name}
                    width={100}
                    height={40}
                    className="w-full h-36 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 flex-shrink-0">
                    {image_url ? 'Chargement...' : 'Pas d\'image'}
                  </div>
                )}
              </div>
              
              <div className="flex flex-1 items-center pt-2 justify-between">
                <h3 className="font-semibold text-lg text-center mb-3">{name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal({ id, name, image_url, user_id: userId, created_at: new Date().toISOString() })
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
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label='nouveau theme'
          className="bg-btn-add text-white px-3 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

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

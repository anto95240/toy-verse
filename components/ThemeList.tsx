'use client'

import React, { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Theme } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import ThemeModal from './ThemeModal'
import Image from 'next/image'
import { createSlug } from "@/lib/slugUtils"
import { useToast } from '@/context/ToastContext'

interface ThemesListProps {
  initialThemes: Theme[]
  userId: string
  onThemeClick?: (theme: Theme) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ThemesList({ initialThemes, userId, onThemeClick }: ThemesListProps) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null)

  const supabase = getSupabaseClient()
  const router = useRouter()
  const { showToast } = useToast()

  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({})

  useEffect(() => {
    async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath

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
    showToast("Thème créé avec succès !", "success")
    if (newTheme.image_url) {
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
    showToast("Thème mis à jour", "success")
    if (updatedTheme.image_url) {
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

  // Fonction qui gère le clic sur un thème
  const handleThemeClick = (theme: Theme) => {
    if (onThemeClick) {
      onThemeClick(theme)
    } else {
      // Comportement par défaut si pas de callback
      const slug = createSlug(theme.name)
      router.push(`/${slug}`)
    }
  }

  async function handleDeleteTheme(themeId: string) {
    if (isLoading) return
    if (!confirm("Voulez-vous vraiment supprimer ce thème ?")) return

    setIsLoading(true)

    try {
      const { error } = await supabase.from('themes').delete().eq('id', themeId)

      if (error) {
        showToast("Erreur : " + error.message, "error")
      } else {
        setThemes(prev => prev.filter(t => t.id !== themeId))
        showToast("Thème supprimé de la collection.", "info")
      }
    } catch (err) {
      showToast("Erreur inattendue lors de la suppression", "error")
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
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {themes.map((theme) => (
            <li
              key={theme.id}
              className="modern-card rounded-2xl cursor-pointer p-6 flex flex-col items-center floating-animation glow-effect"
            >
              <div 
                className="cursor-pointer w-full"
                onClick={() => handleThemeClick(theme)}
              >
                {imageUrls[theme.id] ? (
                  <Image
                    src={imageUrls[theme.id]!}
                    alt={theme.name}
                    width={100}
                    height={40}
                    className="w-full h-36 object-cover rounded-md flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 flex-shrink-0">
                    {theme.image_url ? 'Chargement...' : 'Pas d\'image'}
                  </div>
                )}
              </div>

              <div className="flex flex-1 items-center pt-2 justify-between w-full">
                <h3 className="font-semibold text-lg text-center mb-3">{theme.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(theme)
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
                      handleDeleteTheme(theme.id)
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

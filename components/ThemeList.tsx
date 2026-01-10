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
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'

interface ThemesListProps {
  initialThemes: Theme[]
  userId: string
  onThemeClick?: (theme: Theme) => void
}

export default function ThemesList({ initialThemes, userId, onThemeClick }: ThemesListProps) {
  // États des données
  const [themes, setThemes] = useState<Theme[]>(initialThemes)
  
  // États de l'interface (Modale Édition/Ajout)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null)
  
  // États pour la suppression sécurisée (Modale Suppression)
  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Hooks et Utilitaires
  const supabase = getSupabaseClient()
  const router = useRouter()
  const { showToast } = useToast()
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({})

  // Chargement des images signées (Supabase Storage)
  useEffect(() => {
    async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
      if (!imagePath) return null
      if (imagePath.startsWith('http')) return imagePath
      
      const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
      const { data, error } = await supabase.storage.from('toys-images').createSignedUrl(fullPath, 3600)
      
      if (error) return null
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

  // --- GESTION AJOUT / MODIFICATION ---

  function handleAddTheme(newTheme: Theme) {
    setThemes(prev => [newTheme, ...prev])
    showToast(`Thème "${newTheme.name}" créé avec succès`, "success")
  }

  function handleUpdateTheme(updatedTheme: Theme) {
    setThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t))
    showToast(`Thème "${updatedTheme.name}" mis à jour`, "success")
  }

  function openEditModal(theme: Theme) {
    setThemeToEdit(theme)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setThemeToEdit(null)
  }

  // --- NAVIGATION ---

  const handleThemeClick = (theme: Theme) => {
    if (onThemeClick) {
      onThemeClick(theme)
    } else {
      router.push(`/${createSlug(theme.name)}`)
    }
  }

  // --- GESTION SUPPRESSION (MODALE + TOAST) ---
  
  // Étape 1 : Demande de suppression (Ouvre la modale)
  const handleDeleteRequest = (e: React.MouseEvent, theme: Theme) => {
    e.stopPropagation() // Empêche d'entrer dans le thème lors du clic sur la poubelle
    setThemeToDelete(theme)
  }

  // Étape 2 : Confirmation (Exécute la suppression)
  const handleConfirmDelete = async () => {
    if (!themeToDelete) return
    setIsDeleting(true)

    const { id: themeId, name: themeName } = themeToDelete

    try {
      // Suppression en base de données
      const { error } = await supabase.from('themes').delete().eq('id', themeId)
      
      if (error) {
        showToast(`Erreur lors de la suppression de "${themeName}"`, "error")
        console.error("Erreur suppression thème:", error)
      } else {
        // Mise à jour de l'état local
        setThemes(prev => prev.filter(t => t.id !== themeId))
        showToast(`Le thème "${themeName}" a été supprimé`, "success")
      }
    } catch (err) {
      showToast("Une erreur inattendue est survenue", "error")
      console.error("Erreur inattendue:", err)
    } finally {
      // Nettoyage et fermeture
      setIsDeleting(false)
      setThemeToDelete(null)
    }
  }

  // --- RENDU ---

  return (
    <>
      {themes.length === 0 ? (
        // État vide
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
        // Grille des thèmes
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {themes.map((theme) => (
            <li 
              key={theme.id} 
              className="modern-card rounded-2xl cursor-pointer p-6 flex flex-col items-center floating-animation glow-effect w-full max-w-sm"
            >
              {/* Image cliquable */}
              <div className="cursor-pointer w-full" onClick={() => handleThemeClick(theme)}>
                {imageUrls[theme.id] ? (
                  <Image 
                    src={imageUrls[theme.id]!} 
                    alt={theme.name} 
                    width={400} 
                    height={160} 
                    className="w-full h-36 object-cover rounded-md flex-shrink-0" 
                    loading="lazy" 
                  />
                ) : (
                  <div className="w-full h-36 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 flex-shrink-0 border border-gray-300">
                    {theme.image_url ? 'Chargement...' : 'Pas d\'image'}
                  </div>
                )}
              </div>

              {/* Contenu carte (Nom + Actions) */}
              <div className="flex flex-1 items-center pt-4 justify-between w-full mt-2">
                <h3 className="font-semibold text-lg text-center truncate flex-1 pr-2" title={theme.name}>
                  {theme.name}
                </h3>
                
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(theme) }} 
                    className="text-btn-edit hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                    aria-label={`Modifier ${theme.name}`}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteRequest(e, theme)} 
                    className="text-btn-delete hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    aria-label={`Supprimer ${theme.name}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Bouton flottant d'ajout */}
      <div className="fixed bottom-24 right-6 sm:bottom-6 z-40">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-btn-add text-white w-12 h-12 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center hover:scale-105 transform duration-200"
          aria-label="Ajouter un thème"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xl" />
        </button>
      </div>

      {/* Modale d'ajout / modification */}
      <ThemeModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onAddTheme={handleAddTheme} 
        onUpdateTheme={handleUpdateTheme} 
        themeToEdit={themeToEdit} 
      />

      {/* MODALE DE CONFIRMATION DE SUPPRESSION */}
      <DeleteConfirmationModal
        isOpen={!!themeToDelete}
        onClose={() => setThemeToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Supprimer ce thème ?"
        message={`Attention, vous êtes sur le point de supprimer le thème "${themeToDelete?.name}". Cette action supprimera également tous les jouets associés à ce thème. Êtes-vous sûr ?`}
      />
    </>
  )
}
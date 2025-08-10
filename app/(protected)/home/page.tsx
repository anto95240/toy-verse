// /app/(protected)/home/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Theme } from '@/types/theme'
import { Session } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import ThemeModal from '@/components/ThemeModal'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [themeToEdit, setThemeToEdit] = useState<Theme | null>(null)
  const router = useRouter()

  async function fetchThemes(userId: string) {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erreur récupération thèmes : ' + error.message)
      setThemes([])
      return
    }

    if (!data) {
      setThemes([])
      return
    }

    const withSignedUrls = await Promise.all(
      data.map(async (theme) => {
        if (theme.image_url && !theme.image_url.startsWith('http')) {
          const { data: signed, error: urlError } = await supabase.storage
            .from('toys-images')
            .createSignedUrl(theme.image_url, 3600)

          if (urlError) {
            console.error("Erreur génération URL signée :", urlError.message)
            return { ...theme, image_url: null }
          }
          return { ...theme, image_url: signed?.signedUrl || null }
        }
        return theme
      })
    )

    setThemes(withSignedUrls)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/auth')
      } else {
        setSession(data.session)
        fetchThemes(data.session.user.id).finally(() => setLoading(false))
      }
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  function handleAddTheme(theme: Theme) {
    setThemes(prev => [theme, ...prev])
    alert(`Thème ajouté : ${theme.name}`)
  }

  async function handleUpdateTheme(updatedTheme: Theme) {
    setThemes(prev => prev.map(t => t.id === updatedTheme.id ? updatedTheme : t))
    alert(`Thème modifié : ${updatedTheme.name}`)
  }

  async function handleDeleteTheme(themeId: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce thème ?")) return
    const { error } = await supabase.from('themes').delete().eq('id', themeId)
    if (error) alert("Erreur suppression : " + error.message)
    else setThemes(prev => prev.filter(t => t.id !== themeId))
  }

  if (loading || !session) return <div>Chargement...</div>

  const prenom = session.user.user_metadata?.first_name || 'Utilisateur'

  return (
    <>
      <Navbar prenom={prenom} onLogout={handleLogout} />
      <main className="p-8 min-h-[70vh]">
        <h1 className="text-2xl mb-6 text-center">Vos thèmes</h1>
        {themes.length === 0 ? (
          <p className="text-center">Aucun thème ajouté</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {themes.map(({ id, name, image_url }) => (
              <li
                key={id}
                className="rounded-xl p-3 cursor-pointer hover:shadow-lg transition border border-black"
                onClick={() => router.push(`/theme/${id}`)}
              >
                <div className="flex items-center gap-4">
                  {image_url ? (
                    <img
                      src={image_url}
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

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setThemeToEdit(themes.find(t => t.id === id) || null)
                        setIsModalOpen(true)
                      }}
                      className="text-btn-edit hover:text-green-800 font-bold"
                      title="Modifier thème"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTheme(id)
                      }}
                      className="text-btn-delete hover:text-red-800 font-bold"
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
      </main>

      <button
        onClick={() => {
          setThemeToEdit(null)
          setIsModalOpen(true)
        }}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg transition"
        aria-label="Ajouter un thème"
        title="Ajouter un thème"
      >
        +
      </button>

      <ThemeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTheme={handleAddTheme}
        onUpdateTheme={handleUpdateTheme}
        themeToEdit={themeToEdit}
      />
    </>
  )
}

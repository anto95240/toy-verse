'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Session } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import ThemeModal from '@/components/ThemeModal'

type Theme = {
  id: number
  name: string
  image_url: string | null
}

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login')
      } else {
        setSession(data.session)
        setLoading(false)
        fetchThemes(data.session.user.id)
      }
    })
  }, [router, supabase])

  async function fetchThemes(userId: string) {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erreur récupération thèmes : ' + error.message)
    } else if (data) {
      setThemes(data)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function handleAddTheme(theme: Theme) {
    setThemes(prev => [theme, ...prev])
    alert(`Thème ajouté : ${theme.name}`)
  }

  // Suppression
  async function handleDeleteTheme(themeId: number) {
    if (!confirm("Voulez-vous vraiment supprimer ce thème ?")) return
    const { error } = await supabase.from('themes').delete().eq('id', themeId)
    if (error) alert("Erreur suppression : " + error.message)
    else setThemes(prev => prev.filter(t => t.id !== themeId))
  }

  if (loading) return <div>Chargement...</div>
  if (!session) return null

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
                className="bg-blue-100 rounded-md p-3 cursor-pointer relative hover:shadow-lg transition"
              >
                <div
                  onClick={() => router.push(`/themes/${id}`)}
                  className="flex flex-col items-center gap-2"
                >
                  {image_url ? (
                    <img
                      src={image_url}
                      alt={name}
                      className="w-24 h-24 object-cover rounded-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-300 rounded-md flex items-center justify-center text-gray-600">
                      Pas d’image
                    </div>
                  )}
                  <span className="font-semibold">{name}</span>
                </div>

                {/* Bouton supprimer */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteTheme(id)
                  }}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                  title="Supprimer thème"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Bouton flottant */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg transition"
        aria-label="Ajouter un thème"
        title="Ajouter un thème"
      >
        +
      </button>

      {/* Popup modal */}
      <ThemeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTheme={handleAddTheme}
      />
    </>
  )
}

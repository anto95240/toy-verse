// app/theme/[id]/ThemePageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Theme } from '@/types/theme'
import { Session } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'

interface ThemePageClientProps {
  themeId: string
  themeName: string
  image_url: string | null
}

export default function ThemePageClient({ themeId, themeName, image_url }: ThemePageClientProps) {
  const [imageSignedUrl, setImageSignedUrl] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [themes, setThemes] = useState<Theme[]>([])
  const router = useRouter()

  // Génération URL signée si nécessaire
  useEffect(() => {
    if (!image_url) return

    // Si déjà URL complète
    if (image_url.startsWith('http')) {
      setImageSignedUrl(image_url)
      return
    }

    supabase.storage
      .from('toys-images')
      .createSignedUrl(image_url, 3600)
      .then(({ data, error }) => {
        if (error) {
          console.error("Erreur génération URL signée :", error.message)
          return
        }
        if (data?.signedUrl) {
          setImageSignedUrl(data.signedUrl)
        }
      })
  }, [image_url, supabase])

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
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) return <div>Chargement...</div>
  if (!session) return <div>Chargement...</div>

  const prenom = session.user.user_metadata?.first_name || 'Utilisateur'

  return (
    <>
      <Navbar prenom={prenom} onLogout={handleLogout} />
      <main className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{themeName}</h1>
        {imageSignedUrl ? (
          <img
            src={imageSignedUrl}
            alt={themeName}
            className="rounded-lg shadow-lg max-w-full"
            loading="lazy"
          />
        ) : (
          <p>Aucune image disponible pour ce thème.</p>
        )}
      </main>
    </>
  )
}

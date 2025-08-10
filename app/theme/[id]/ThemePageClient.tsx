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

  useEffect(() => {
    if (!image_url) return

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
  }, [image_url])

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
    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/auth')
      } else if (isMounted) {
        setSession(data.session)
        fetchThemes(data.session.user.id).finally(() => {
          if (isMounted) setLoading(false)
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading || !session) return <div>Chargement...</div>

  const prenom = session.user.user_metadata?.first_name || 'Utilisateur'

  return (
    <>
      <Navbar prenom={prenom} onLogout={handleLogout} />
      <main className="p-8 max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/home')}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Retour aux thèmes
        </button>
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

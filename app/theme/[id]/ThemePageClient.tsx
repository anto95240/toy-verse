  // app/theme/[id]/ThemePageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { Theme } from '@/types/theme'
import type { Session } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'

interface Toy {
  id: string
  nom: string
  numero: string | null
  nb_pieces: number | null
  taille: string | null
  categorie: string | null
  is_exposed: boolean
  photo_url: string | null
}

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
  const [categories, setCategories] = useState<string[]>([])
  const [toys, setToys] = useState<Toy[]>([])
  const [filters, setFilters] = useState({
    categories: [] as string[],
    nbPiecesRange: '',
    isExposed: null as boolean | null
  })
  const router = useRouter()

  // Gestion URL signée thème
  useEffect(() => {
    if (!image_url) {
      setImageSignedUrl(null)
      return
    }

    if (image_url.startsWith('http')) {
      setImageSignedUrl(image_url)
      return
    }

    supabase.storage
      .from('toys-images')
      .createSignedUrl(image_url, 3600)
      .then(({ data, error }) => {
        if (error) {
          console.error("Erreur génération URL signée thème :", error.message)
          setImageSignedUrl(null)
          return
        }
        if (data?.signedUrl) {
          setImageSignedUrl(data.signedUrl)
        }
      })
  }, [image_url])

  // Récupération session + thèmes utilisateur
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
    return () => { isMounted = false }
  }, [router])

  // Récupérer thèmes utilisateur (optionnel)
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
            console.error("Erreur génération URL signée thème :", urlError.message)
            return { ...theme, image_url: null }
          }
          return { ...theme, image_url: signed?.signedUrl || null }
        }
        return theme
      })
    )

    setThemes(withSignedUrls)
  }

  // Récupérer catégories dynamiques depuis la BDD
  useEffect(() => {
    if (!session) return

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true })

      if (error) {
        alert('Erreur chargement des catégories : ' + error.message)
        setCategories([])
        return
      }

      setCategories(data?.map(cat => cat.name) || [])
    }
    fetchCategories()
  }, [session])

  // Récupérer les jouets filtrés
  useEffect(() => {
    if (!session) return

    async function fetchToys() {
      setLoading(true)
      let query = supabase
        .from('toys')
        .select('*')
        .eq('theme_id', themeId)

      // Filtre catégories
      if (filters.categories.length > 0) {
        query = query.in('categorie', filters.categories)
      }

      // Filtre nb pièces
      if (filters.nbPiecesRange) {
        if (filters.nbPiecesRange === '+1000') {
          query = query.gte('nb_pieces', 1000)
        } else {
          const [min, max] = filters.nbPiecesRange.split('-').map(Number)
          query = query.gte('nb_pieces', min).lte('nb_pieces', max)
        }
      }

      // Filtre exposition
      if (filters.isExposed !== null) {
        query = query.eq('is_exposed', filters.isExposed)
      }

      const { data, error } = await query.order('nom', { ascending: true })
      if (error) {
        alert('Erreur chargement des jouets : ' + error.message)
        setToys([])
        setLoading(false)
        return
      }

      // Générer URLs signées pour photos jouets non-http
      const toysWithSignedUrls = await Promise.all(
        (data || []).map(async (toy) => {
          if (toy.photo_url && !toy.photo_url.startsWith('http')) {
            const { data: signed, error: urlError } = await supabase.storage
              .from('toys-images')
              .createSignedUrl(toy.photo_url, 3600)
            if (urlError) {
              console.error("Erreur URL signée jouet :", urlError.message)
              return { ...toy, photo_url: null }
            }
            return { ...toy, photo_url: signed.signedUrl }
          }
          return toy
        })
      )

      setToys(toysWithSignedUrls)
      setLoading(false)
    }

    fetchToys()
  }, [session, themeId, filters])

  // Handlers filtres
  function toggleCategory(cat: string) {
    setFilters((prev) => {
      const categories = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories }
    })
  }

  function handleNbPiecesChange(range: string) {
    setFilters((prev) => ({ ...prev, nbPiecesRange: range }))
  }

  function handleExposedChange(value: boolean | null) {
    setFilters((prev) => ({ ...prev, isExposed: value }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading || !session) return <div>Chargement...</div>

  const prenom = session.user.user_metadata?.first_name || 'Utilisateur'
  
  return (
    <>
      <Navbar prenom={prenom} onLogout={handleLogout} />
      <main className="p-8 max-w-7xl mx-auto flex gap-8">
        {/* Sidebar filtres */}
        <aside className="w-64 border-r pr-4">
          <h2 className="mb-4 font-bold">Filtres</h2>

          <div>
            {categories.length === 0 && <p>Aucune catégorie disponible</p>}
            {categories.map(cat => (
              <label key={cat} className="block mb-1">
                <input
                  type="checkbox"
                  onChange={() => toggleCategory(cat)}
                  checked={filters.categories.includes(cat)}
                />{' '}
                {cat}
              </label>
            ))}
          </div>

          <div className="mt-6">
            <h3>Nb pièces</h3>
            <label className="block mb-1">
              <input type="radio" name="nb_pieces" onChange={() => handleNbPiecesChange('100-200')} checked={filters.nbPiecesRange === '100-200'} /> 100p - 200p
            </label>
            <label className="block mb-1">
              <input type="radio" name="nb_pieces" onChange={() => handleNbPiecesChange('200-500')} checked={filters.nbPiecesRange === '200-500'} /> 200p - 500p
            </label>
            <label className="block mb-1">
              <input type="radio" name="nb_pieces" onChange={() => handleNbPiecesChange('500-1000')} checked={filters.nbPiecesRange === '500-1000'} /> 500p - 1000p
            </label>
            <label className="block mb-1">
              <input type="radio" name="nb_pieces" onChange={() => handleNbPiecesChange('+1000')} checked={filters.nbPiecesRange === '+1000'} /> +1000p
            </label>
            <label className="block mb-1">
              <input type="radio" name="nb_pieces" onChange={() => handleNbPiecesChange('')} checked={filters.nbPiecesRange === ''} /> Tous
            </label>
          </div>

          <div className="mt-6">
            <h3>État</h3>
            <label className="block mb-1">
              <input type="radio" name="expose" onChange={() => handleExposedChange(true)} checked={filters.isExposed === true} /> En exposition
            </label>
            <label className="block mb-1">
              <input type="radio" name="expose" onChange={() => handleExposedChange(false)} checked={filters.isExposed === false} /> Non exposé
            </label>
            <label className="block mb-1">
              <input type="radio" name="expose" onChange={() => handleExposedChange(null)} checked={filters.isExposed === null} /> Tous
            </label>
          </div>
        </aside>

        <section className="flex-1">
          <button
            onClick={() => router.push('/home')}
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Retour aux thèmes
          </button>

          <h1 className="text-3xl font-bold mb-2">{themeName}</h1>

          {imageSignedUrl ? (
            <img
              src={imageSignedUrl}
              alt={themeName}
              className="rounded-lg shadow-lg max-w-full mb-6"
              loading="lazy"
            />
          ) : (
            <p>Aucune image disponible pour ce thème.</p>
          )}

          {/* Fil d’Ariane simple */}
          <nav className="mb-4 text-sm text-gray-600" aria-label="breadcrumb">
            <ol className="list-reset flex gap-2">
              <li>
                <button
                  onClick={() => router.push('/home')}
                  className="hover:underline"
                >
                  Thèmes
                </button>
              </li>
              <li>/</li>
              <li>{themeName}</li>
            </ol>
          </nav>

          {/* Liste des jouets */}
          {toys.length === 0 ? (
            <p>Aucun jouet trouvé avec les critères sélectionnés.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {toys.map((toy) => (
                <li key={toy.id} className="border rounded p-3 shadow hover:shadow-lg transition">
                  {toy.photo_url ? (
                    <img
                      src={toy.photo_url.startsWith('http') ? toy.photo_url : ''}
                      alt={toy.nom}
                      className="w-full h-48 object-cover rounded mb-2"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded mb-2 text-gray-400">
                      Pas d'image
                    </div>
                  )}
                  <h2 className="font-semibold text-lg">{toy.nom}</h2>
                  <p>Numéro: {toy.numero || 'N/A'}</p>
                  <p>Nb pièces: {toy.nb_pieces ?? 'N/A'}</p>
                  <p>Catégorie: {toy.categorie || 'N/A'}</p>
                  <p>État: {toy.is_exposed ? 'Exposé' : 'Non exposé'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}

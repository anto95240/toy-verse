  // app/theme/[id]/ThemePageClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'
import type { Session } from '@supabase/supabase-js'
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
  const [categories, setCategories] = useState<string[]>([])
  const [toys, setToys] = useState<Toy[]>([])
  const [filters, setFilters] = useState({
    categories: [] as string[],
    nbPiecesRange: '',
    isExposed: null as boolean | null
  })
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Fonction pour obtenir l'URL publique d'une image depuis Supabase Storage
  function getImageUrl(imagePath: string | null): string | null {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    
    // Les images sont dans le dossier themes/ du bucket toys-images
    const fullPath = imagePath.startsWith('themes/') ? imagePath : `themes/${imagePath}`
    const { data } = supabase.storage.from('toys-images').getPublicUrl(imagePath)
    return data.publicUrl
  }

  // Gestion URL thème
  useEffect(() => {
    setImageSignedUrl(getImageUrl(image_url))
  }, [image_url])

  // Récupération session + thèmes utilisateur
  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/auth')
      } else if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [router])

  // Récupérer catégories dynamiques depuis la BDD
  useEffect(() => {
    if (!session) return

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true })

      if (error) {
        console.error('Erreur chargement des catégories:', error)
        setCategories([])
        return
      }

      setCategories(data?.map((cat: { name: string }) => cat.name) || [])
    }
    fetchCategories()
  }, [session])

  // Récupérer les jouets filtrés
  useEffect(() => {
    if (!session) return

    async function fetchToys() {
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
        console.error('Erreur chargement jouets:', error)
        setToys([])
        return
      }

      setToys(data || [])
    }

    fetchToys()
  }, [session, themeId, filters])

  // Handlers filtres
  function toggleCategory(cat: string): void {
    setFilters((prev) => {
      const categories = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories }
    })
  }

  function handleNbPiecesChange(range: string): void {
    setFilters((prev) => ({ ...prev, nbPiecesRange: range }))
  }

  function handleExposedChange(value: boolean | null): void {
    setFilters((prev) => ({ ...prev, isExposed: value }))
  }

  async function handleLogout(): Promise<void> {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  const prenom = session.user.user_metadata?.first_name || 'Utilisateur'
  
  return (
    <>
      <Navbar prenom={prenom} onLogout={handleLogout} />
      <main className="p-8 max-w-7xl mx-auto flex gap-8">
        {/* Sidebar filtres */}
        <aside className="w-64 bg-gray-50 p-4 rounded-lg h-fit">
          <h2 className="mb-4 font-bold text-lg">Filtres</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Catégories</h3>
            {categories.length === 0 && <p className="text-sm text-gray-500">Aucune catégorie disponible</p>}
            {categories.map(cat => (
              <label key={cat} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  onChange={() => toggleCategory(cat)}
                  checked={filters.categories.includes(cat)}
                  className="mr-2"
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Nombre de pièces</h3>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => handleNbPiecesChange('100-200')} 
                checked={filters.nbPiecesRange === '100-200'}
                className="mr-2"
              />
              <span className="text-sm">100 - 200 pièces</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => handleNbPiecesChange('200-500')} 
                checked={filters.nbPiecesRange === '200-500'}
                className="mr-2"
              />
              <span className="text-sm">200 - 500 pièces</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => handleNbPiecesChange('500-1000')} 
                checked={filters.nbPiecesRange === '500-1000'}
                className="mr-2"
              />
              <span className="text-sm">500 - 1000 pièces</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => handleNbPiecesChange('+1000')} 
                checked={filters.nbPiecesRange === '+1000'}
                className="mr-2"
              />
              <span className="text-sm">Plus de 1000 pièces</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="nb_pieces" 
                onChange={() => handleNbPiecesChange('')} 
                checked={filters.nbPiecesRange === ''}
                className="mr-2"
              />
              <span className="text-sm">Toutes les tailles</span>
            </label>
          </div>

          <div>
            <h3 className="font-medium mb-2">État d'exposition</h3>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="expose" 
                onChange={() => handleExposedChange(true)} 
                checked={filters.isExposed === true}
                className="mr-2"
              />
              <span className="text-sm">En exposition</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="expose" 
                onChange={() => handleExposedChange(false)} 
                checked={filters.isExposed === false}
                className="mr-2"
              />
              <span className="text-sm">Non exposé</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="expose" 
                onChange={() => handleExposedChange(null)} 
                checked={filters.isExposed === null}
                className="mr-2"
              />
              <span className="text-sm">Tous les états</span>
            </label>
          </div>
        </aside>

        <section className="flex-1">
          <button
            onClick={() => router.push('/home')}
            className="mb-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            ← Retour aux thèmes
          </button>

          <h1 className="text-3xl font-bold mb-4">{themeName}</h1>

          {imageSignedUrl ? (
            <img
              src={imageSignedUrl}
              alt={themeName}
              className="rounded-lg shadow-lg max-w-md h-64 object-cover mb-6"
              loading="lazy"
            />
          ) : (
            <div className="w-full max-w-md h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <span className="text-gray-500">Aucune image disponible</span>
            </div>
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
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Aucun jouet trouvé avec les critères sélectionnés.
              </p>
              <button
                onClick={() => setFilters({
                  categories: [],
                  nbPiecesRange: '',
                  isExposed: null
                })}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {toys.length} jouet{toys.length > 1 ? 's' : ''} trouvé{toys.length > 1 ? 's' : ''}
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {toys.map((toy) => (
                  <li key={toy.id} className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                    {getImageUrl(toy.photo_url) ? (
                      <img
                        src={getImageUrl(toy.photo_url)!}
                        alt={toy.nom}
                        className="w-full h-48 object-cover rounded-md mb-3"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-md mb-3 text-gray-400">
                        Pas d'image
                      </div>
                    )}
                    <div className="space-y-2">
                      <h2 className="font-semibold text-lg text-gray-800">{toy.nom}</h2>
                      <div className="text-sm text-gray-600 space-y-1">
                        {toy.numero && <p><span className="font-medium">Numéro:</span> {toy.numero}</p>}
                        {toy.nb_pieces && <p><span className="font-medium">Pièces:</span> {toy.nb_pieces}</p>}
                        {toy.taille && <p><span className="font-medium">Taille:</span> {toy.taille}</p>}
                        {toy.categorie && <p><span className="font-medium">Catégorie:</span> {toy.categorie}</p>}
                        <p>
                          <span className="font-medium">État:</span>{' '}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            toy.is_exposed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {toy.is_exposed ? 'Exposé' : 'Non exposé'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </>
  )
}

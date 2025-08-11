'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Session } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import ToyModal from '@/components/ToyModal'

interface ToyPageClientProps {
  toyId: string
  toyName: string
  image_url: string | null
}

interface ThemePageClientProps {
  themeId: string
  themeName: string
  image_url: string | null
  toysCount?: number
}

interface Props {
  toy: ToyPageClientProps | null
  theme: ThemePageClientProps
}

const initialFilters = {
  categories: [],
  nbPiecesRange: '',
  isExposed: null,
  isSoon: null,
};


export default function ToyPageClient({ toy, theme }: Props) {
  const router = useRouter()
  const supabase = getSupabaseClient()

  // États
  const [session, setSession] = useState<Session | null>(null)
  const [toys, setToys] = useState<Toy[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filters, setFilters] = useState({
    categories: [] as string[],
    nbPiecesRange: '',
    isExposed: null as boolean | null,
    isSoon: null as boolean | null,
  })
  const [toyImageUrls, setToyImageUrls] = useState<Record<string, string | null>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toyToEdit, setToyToEdit] = useState<Toy | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtersInit, setFiltersInit] = useState(initialFilters);
  const [toysCount, setToysCount] = useState<number>(0)


  // Fonction pour récupérer une URL signée pour une image stockée dans Supabase Storage
  async function getSignedImageUrl(imagePath: string | null): Promise<string | null> {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath

    const fullPath = imagePath.startsWith('toys/') ? imagePath : `toys/${imagePath}`
    const { data, error } = await supabase.storage
      .from('toys-images')
      .createSignedUrl(fullPath, 3600)

    if (error) {
      console.error('Erreur création URL signée:', error)
      return null
    }
    return data.signedUrl
  }

  // Chargement session et redirection si pas connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/auth')
      } else {
        setSession(data.session)
        setLoading(false)
      }
    })
  }, [router, supabase])

  // Charger les catégories dès que la session est prête
  useEffect(() => {
  if (!session) return

  supabase
    .from('toys')
    .select('categorie', { count: 'exact', head: false }) // `distinct` n'est plus accepté ici
    .order('categorie', { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error('Erreur chargement catégories:', error)
        setCategories([])
      } else {
        // data est du type [{ categorie: string }, ...]
        setCategories(data?.map(c => c.categorie).filter(Boolean) || [])
      }
    })
}, [session, supabase])

  // Charger jouets selon thème et filtres
  useEffect(() => {
    if (!session) return

    let query = supabase
      .from('toys')
      .select('*')
      .eq('theme_id', theme.themeId)
      

    if (filters.categories.length > 0) query = query.in('categorie', filters.categories)

    if (filters.nbPiecesRange) {
      if (filters.nbPiecesRange === '+1000') {
        query = query.gte('nb_pieces', 1000)
      } else {
        const [min, max] = filters.nbPiecesRange.split('-').map(Number)
        query = query.gte('nb_pieces', min).lte('nb_pieces', max)
      }
    }

    if (filters.isExposed !== null) query = query.eq('is_exposed', filters.isExposed)
    if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

    query.order('nom', { ascending: true }).then(({ data, error }) => {
      if (error) {
        console.error('Erreur chargement jouets:', error)
        setToys([])
      } else {
        setToys(data || [])
      }
    })
  }, [session, theme.themeId, filters, supabase])

  // Charger URLs signées des images à chaque changement de liste de jouets
  useEffect(() => {
    async function loadToyImages() {
      const urls: Record<string, string | null> = {}
      for (const toy of toys) {
        if (toy.photo_url) {
          urls[toy.id] = await getSignedImageUrl(toy.photo_url)
        } else {
          urls[toy.id] = null
        }
      }
      setToyImageUrls(urls)
    }
    if (toys.length > 0) loadToyImages()
    else setToyImageUrls({})
  }, [toys])

  // Gestion filtres
  function toggleCategory(cat: string) {
    setFilters(prev => {
      const categories = prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories }
    })
  }

  function handleNbPiecesChange(range: string) {
    setFilters(prev => ({ ...prev, nbPiecesRange: range }))
  }

  function handleExposedChange(value: boolean | null) {
    setFilters(prev => ({ ...prev, isExposed: value }))
  }

  function handleSoonChange(value: boolean | null) {
    setFilters(prev => ({ ...prev, isSoon: value }))
  }

  // Supprimer un jouet
  async function handleDeleteToy(toyIdToDelete: string) {
    if (!confirm('Confirmer la suppression de ce jouet ?')) return

    const { error } = await supabase.from('toys').delete().eq('id', toyIdToDelete)
    if (error) {
      alert('Erreur lors de la suppression')
      console.error('Erreur suppression jouet:', error)
    } else {
      setToys(prev => prev.filter(t => t.id !== toyIdToDelete))
      setToyImageUrls(prev => {
        const copy = { ...prev }
        delete copy[toyIdToDelete]
        return copy
      })
    }
  }

  // Sauvegarder ajout/modif jouet
  function handleSaveToy(savedToy: Toy) {
    setToys(prev => {
      const exists = prev.find(t => t.id === savedToy.id)
      if (exists) return prev.map(t => (t.id === savedToy.id ? savedToy : t))
      return [...prev, savedToy]
    })
    getSignedImageUrl(savedToy.photo_url).then(url => {
      setToyImageUrls(prev => ({ ...prev, [savedToy.id]: url }))
    })
  }

  function resetFilters() {
    setFilters(initialFilters);
  }

  // Modal gestion
  function openModalForEdit(toy: Toy) {
    setToyToEdit(toy)
    setIsModalOpen(true)
  }

  function openModalForAdd() {
    setToyToEdit(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  // Déconnexion
  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/auth')
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
      <main className="p-8 max-w-7xl flex gap-8">
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

          <div className="mb-6">
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
          <div>
            <h3 className="font-medium mb-2">État de nouveauté</h3>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="soon" 
                onChange={() => handleSoonChange(true)} 
                checked={filters.isSoon === true}
                className="mr-2"
              />
              <span className="text-sm">Prochainement</span>
            </label>
            <label className="flex items-center mb-2 cursor-pointer">
              <input 
                type="radio" 
                name="soon" 
                onChange={() => handleSoonChange(null)} 
                checked={filters.isSoon === null}
                className="mr-2"
              />
              <span className="text-sm">Tous les états</span>
            </label>
          </div>
          
          <button
            onClick={resetFilters}
            className="my-6 px-3 py-1 text-sm bg-gray-200 text-black rounded-md"
          >
            Réinitialiser tous les filtres
          </button>
        </aside>

        {/* Section principale - liste des jouets */}
        <section className="flex-1">
          <button
            onClick={() => router.push('/home')}
            className="mb-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            ← Retour aux thèmes
          </button>

          <nav className="text-sm text-gray-600 mb-4" aria-label="breadcrumb">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <a href="/" className="hover:underline">Home</a>
                <span className="mx-2"> &gt; </span>
              </li>
              <li className="flex items-center text-gray-800 font-semibold">
                {theme.themeName}
              </li>
            </ol>
            <span className="ml-4 text-gray-500">(Total jouets : {theme.toysCount})</span>
          </nav>

          {toys.length === 0 ? (
            <p>Aucun jouet trouvé pour ces critères.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {toys.map(toy => (
                <li
                  key={toy.id}
                  className="border rounded p-4 flex flex-col items-center shadow-sm hover:shadow-md cursor-pointer"
                >
                  {toyImageUrls[toy.id] ? (
                    <img
                      src={toyImageUrls[toy.id] || undefined}
                      alt={toy.nom}
                      className="w-full h-40 object-contain mb-4"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center mb-4 text-gray-400">
                      Pas d'image
                    </div>
                  )}
                  <h3 className="font-semibold text-lg mb-1 text-center">{toy.nom}</h3>
                  <p className="text-sm text-gray-600 mb-1 text-center">
                    Catégorie : {toy.categorie || '—'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1 text-center">
                    Pièces : {toy.nb_pieces}
                  </p>
                  {toy.is_exposed && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      Exposé
                    </span>
                  )}
                  {toy.is_soon && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded ml-2">
                      Bientôt
                    </span>
                  )}
                  <div className='flex ml-auto gap-4'>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        openModalForEdit(toy)
                      }}
                      className="mt-3 text-sm text-green-600 hover:underline"
                      title="modifier ce jouet"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                    onClick={e => {
                      e.stopPropagation()
                      handleDeleteToy(toy.id)
                    }}
                    className="mt-3 text-sm text-red-600 hover:underline"
                    title="Supprimer ce jouet"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
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

        </section>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <ToyModal
          isOpen={isModalOpen}
          themeId={theme.themeId}
          toy={toyToEdit}
          onClose={closeModal}
          onSave={handleSaveToy}
        />
      )}
    </>
  )
}

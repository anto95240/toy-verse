'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/utils/supabase/client'
import type { Toy } from '@/types/theme'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { Session } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import ToyModal from '@/components/ToyModal'
import FilterSidebar from '@/components/FilterSidebar'
import ToyGrid from '@/components/ToyGrid'

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
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filterCounts, setFilterCounts] = useState<{
    categories: Record<string, number>
    nbPiecesRanges: Record<string, number>
    exposed: { true: number; false: number }
    soon: { true: number; false: number }
  }>({
    categories: {},
    nbPiecesRanges: {},
    exposed: { true: 0, false: 0 },
    soon: { true: 0, false: 0 }
  })

  const filteredToysCount = toys.length;


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
    .select('categorie', { distinct: true } as any)
    .order('categorie', { ascending: true })
    .then(({ data, error }) => {
      if (error) {
        console.error('Erreur chargement catégories:', error)
        setCategories([])
      } else {
        const uniqueCategories = Array.from(new Set(data?.map(c => c.categorie).filter(Boolean) || []))
        setCategories(uniqueCategories)
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

  // Charger les compteurs pour tous les filtres
  useEffect(() => {
    if (!session) return

    async function fetchFilterCounts() {
      // Compteurs par catégorie
      const categoryCounts: Record<string, number> = {}
      await Promise.all(
        categories.map(async (cat) => {
          let query = supabase
            .from('toys')
            .select('id', { count: 'exact', head: true })
            .eq('theme_id', theme.themeId)
            .eq('categorie', cat)

          // Appliquer les autres filtres (pas le filtre catégorie)
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

          const { count, error } = await query
          if (error) {
            console.error('Erreur count catégorie:', error)
            categoryCounts[cat] = 0
          } else {
            categoryCounts[cat] = count || 0
          }
        })
      )

      // Compteurs par nombre de pièces
      const nbPiecesRanges = ['100-200', '200-500', '500-1000', '+1000']
      const nbPiecesCounts: Record<string, number> = {}
      
      await Promise.all(
        nbPiecesRanges.map(async (range) => {
          let query = supabase
            .from('toys')
            .select('id', { count: 'exact', head: true })
            .eq('theme_id', theme.themeId)

          // Appliquer le filtre de nombre de pièces
          if (range === '+1000') {
            query = query.gte('nb_pieces', 1000)
          } else {
            const [min, max] = range.split('-').map(Number)
            query = query.gte('nb_pieces', min).lte('nb_pieces', max)
          }

          // Appliquer les autres filtres
          if (filters.categories.length > 0) query = query.in('categorie', filters.categories)
          if (filters.isExposed !== null) query = query.eq('is_exposed', filters.isExposed)
          if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

          const { count, error } = await query
          if (error) {
            console.error('Erreur count nb_pieces:', error)
            nbPiecesCounts[range] = 0
          } else {
            nbPiecesCounts[range] = count || 0
          }
        })
      )

      // Compteurs pour exposition
      const exposedCounts = { true: 0, false: 0 }
      await Promise.all(
        [true, false].map(async (isExposed) => {
          let query = supabase
            .from('toys')
            .select('id', { count: 'exact', head: true })
            .eq('theme_id', theme.themeId)
            .eq('is_exposed', isExposed)

          // Appliquer les autres filtres
          if (filters.categories.length > 0) query = query.in('categorie', filters.categories)
          if (filters.nbPiecesRange) {
            if (filters.nbPiecesRange === '+1000') {
              query = query.gte('nb_pieces', 1000)
            } else {
              const [min, max] = filters.nbPiecesRange.split('-').map(Number)
              query = query.gte('nb_pieces', min).lte('nb_pieces', max)
            }
          }
          if (filters.isSoon !== null) query = query.eq('is_soon', filters.isSoon)

          const { count, error } = await query
          if (error) {
            console.error('Erreur count exposition:', error)
          } else {
            exposedCounts[isExposed] = count || 0
          }
        })
      )

      // Compteurs pour "prochainement"
      let soonQuery = supabase
        .from('toys')
        .select('id', { count: 'exact', head: true })
        .eq('theme_id', theme.themeId)
        .eq('is_soon', true)

      // Appliquer les autres filtres
      if (filters.categories.length > 0) soonQuery = soonQuery.in('categorie', filters.categories)
      if (filters.nbPiecesRange) {
        if (filters.nbPiecesRange === '+1000') {
          soonQuery = soonQuery.gte('nb_pieces', 1000)
        } else {
          const [min, max] = filters.nbPiecesRange.split('-').map(Number)
          soonQuery = soonQuery.gte('nb_pieces', min).lte('nb_pieces', max)
        }
      }
      if (filters.isExposed !== null) soonQuery = soonQuery.eq('is_exposed', filters.isExposed)

      const { count: soonCount, error: soonError } = await soonQuery
      const soonCounts = { true: soonCount || 0, false: 0 }

      setFilterCounts({
        categories: categoryCounts,
        nbPiecesRanges: nbPiecesCounts,
        exposed: exposedCounts,
        soon: soonCounts
      })
    }

    fetchFilterCounts()
  }, [session, theme.themeId, categories, filters.nbPiecesRange, filters.isExposed, filters.isSoon])

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
      <Navbar prenom={prenom} />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtres - Desktop */}
          <FilterSidebar
            categories={categories}
            filters={filters}
            filterCounts={filterCounts}
            onToggleCategory={toggleCategory}
            onNbPiecesChange={handleNbPiecesChange}
            onExposedChange={handleExposedChange}
            onSoonChange={handleSoonChange}
            onResetFilters={resetFilters}
            className="hidden lg:block w-64 h-fit"
          />

          {/* Section principale - liste des jouets */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <button
                onClick={() => router.push('/home')}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2 w-fit"
              >
                ← Retour aux thèmes
              </button>

              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={showMobileFilters ? faXmark : faBars} />
                Filtres
              </button>
            </div>

            {/* Fil d'Ariane */}
            <nav className="text-sm text-gray-600 mb-4" aria-label="breadcrumb">
              <ol className="list-none p-0 inline-flex flex-wrap">
                <li className="flex items-center">
                  <button onClick={() => router.push('/home')} className="hover:underline">
                    Home
                  </button>
                  <span className="mx-2"> > </span>
                </li>
                <li className="flex items-center text-gray-800 font-semibold">
                  {theme.themeName}
                </li>
              </ol>
              <span className="ml-0 sm:ml-4 block sm:inline text-gray-500">
                (Total jouets : {filteredToysCount})
              </span>
            </nav>

            {/* Filtres mobile */}
            {showMobileFilters && (
              <div className="lg:hidden mb-6">
                <FilterSidebar
                  categories={categories}
                  filters={filters}
                  filterCounts={filterCounts}
                  onToggleCategory={toggleCategory}
                  onNbPiecesChange={handleNbPiecesChange}
                  onExposedChange={handleExposedChange}
                  onSoonChange={handleSoonChange}
                  onResetFilters={resetFilters}
                />
              </div>
            )}

            {/* Grille des jouets */}
            <ToyGrid
              toys={toys}
              toyImageUrls={toyImageUrls}
              onEditToy={openModalForEdit}
              onDeleteToy={handleDeleteToy}
            />

            {/* Bouton flottant d'ajout */}
            <div className="fixed bottom-6 right-6">
              <button
                onClick={() => openModalForAdd()}
                aria-label='nouveau jouet'
                className="bg-btn-add text-white px-3 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

          </section>
        </div>
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
"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme"
import type { Session } from "@supabase/supabase-js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSort, faListOl } from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
import ToyModal from "@/components/toys/ToyModal"
import FilterSidebar from "@/components/filters/FilterSidebar"
import ToyGrid from "@/components/toyGrid/ToyGrid"
import ThemeHeader from "@/components/theme/ThemeHeader"
import Pagination from "@/components/common/Pagination"
import ScrollToTop from "@/components/common/ScrollToTop"
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal"
import { useToyFilters } from "@/hooks/useToyFilters"
import { useToyImages } from "@/hooks/useToyImages"
import { createSlug } from "@/lib/slugUtils"
import { useToast } from "@/context/ToastContext"

interface Props {
  theme: {
    themeId: string
    themeName: string
    image_url: string | null
    toysCount: number
    userId: string
  }
}

// Type pour les critères de tri
type SortCriteria = 'added_desc' | 'added_asc' | 'release_desc' | 'release_asc'

export default function ToyPageClient({ theme }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const { showToast } = useToast()

  // États
  const [session, setSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toyToEdit, setToyToEdit] = useState<Toy | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [view, setView] = useState<'collection' | 'wishlist'>('collection')
  const [currentPage, setCurrentPage] = useState(1)
  
  // États de pagination et de tri
  const [itemsPerPage, setItemsPerPage] = useState(24)
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('added_desc')

  // États pour la suppression
  const [toyToDeleteId, setToyToDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Hooks personnalisés
  const {
    toys, setToys, categories, studios, releaseYears, filters, filterCounts, totalToys,
    toggleCategory, toggleStudio, handleNbPiecesChange, handleExposedChange, handleSoonChange, handleReleaseYearChange, resetFilters,
    refreshCounts,
    updateCountsOptimistically
  } = useToyFilters(theme.themeId, !!session)

  const { toyImageUrls, updateToyImageUrl, removeToyImageUrl } = useToyImages(toys, currentUserId)

  const toyMatchesCurrentFilters = useCallback((toy: Toy) => {
    if (filters.isSoon !== null && toy.is_soon !== filters.isSoon) return false
    if (filters.isExposed !== null && toy.is_exposed !== filters.isExposed) return false
    if (filters.categories.length > 0 && (!toy.categorie || !filters.categories.includes(toy.categorie))) return false
    if (filters.studios.length > 0 && (!toy.studio || !filters.studios.includes(toy.studio))) return false
    if (filters.releaseYear && toy.release_date?.toString() !== filters.releaseYear) return false
    if (filters.nbPiecesRange) {
        const nb = toy.nb_pieces || 0
        const [minStr, maxStr] = filters.nbPiecesRange.split('-')
        const min = parseInt(minStr)
        const max = maxStr === '+' ? 999999 : parseInt(maxStr)
        if (filters.nbPiecesRange.includes('+')) { if (nb < 2000) return false } else { if (nb < min || nb > max) return false }
    }
    return true
  }, [filters])

  // --- LOGIQUE DETECTION ACTION URL ---
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') {
      setToyToEdit(null)
      setIsModalOpen(true)
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('action')
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
    }
  }, [searchParams, pathname, router])

  // --- LOGIQUE DE SYNCHRONISATION VUE <-> FILTRE ---
  useEffect(() => {
    handleSoonChange(false)
  }, [handleSoonChange])

  useEffect(() => {
    if (filters.isSoon === true && view !== 'wishlist') setView('wishlist')
    else if (filters.isSoon === false && view !== 'collection') setView('collection')
  }, [filters.isSoon, view])

  const handleViewChange = (newView: 'collection' | 'wishlist') => {
    setView(newView)
    handleSoonChange(newView === 'wishlist' ? true : false)
    setCurrentPage(1)
  }

  // --- SEARCH ---
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    const searchYear = searchParams.get('year')

    if (searchQuery && toys.length > 0) {
      const foundToy = toys.find(toy => toy.nom.toLowerCase().includes(searchQuery.toLowerCase()))
      if (foundToy) {
        setSearchResults([{ ...foundToy, theme_name: theme.themeName }])
        setIsSearchActive(true)
        router.replace(`/${createSlug(theme.themeName)}`, { scroll: false })
      }
    } else if (searchYear && toys.length > 0) {
      const foundToys = toys.filter(toy => toy.release_date && new Date(toy.release_date).getFullYear().toString() === searchYear)
      setSearchResults(foundToys.map(toy => ({ ...toy, theme_name: theme.themeName })))
      setIsSearchActive(true)
      router.replace(`/${createSlug(theme.themeName)}`, { scroll: false })
    }
  }, [toys, searchParams, theme.themeName, router])

  const handleSearchResults = useCallback((results: (Toy & { theme_name: string })[]) => {
    setSearchResults(results)
    setIsSearchActive(results.length > 0)
    setCurrentPage(1)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
    setIsSearchActive(false)
    setCurrentPage(1)
  }, [])

  const getDisplayedToys = useCallback(() => {
    if (!isSearchActive) return toys
    if (searchResults.length === 1) return searchResults
    return searchResults.filter(toy => toy.theme_id === theme.themeId)
  }, [isSearchActive, toys, searchResults, theme.themeId])

  const displayedToys = getDisplayedToys()

  // --- LOGIQUE DE TRI ---
  const sortedToys = useMemo(() => {
    const sorted = [...displayedToys]
    sorted.sort((a, b) => {
       switch (sortCriteria) {
          case 'added_desc':
             return (new Date(b.created_at || 0).getTime()) - (new Date(a.created_at || 0).getTime())
          case 'added_asc':
             return (new Date(a.created_at || 0).getTime()) - (new Date(b.created_at || 0).getTime())
          case 'release_desc':
             if (!a.release_date && !b.release_date) return 0
             if (!a.release_date) return 1
             if (!b.release_date) return -1
             return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
          case 'release_asc':
             if (!a.release_date && !b.release_date) return 0
             if (!a.release_date) return 1
             if (!b.release_date) return -1
             return new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
          default:
             return 0
       }
    })
    return sorted
  }, [displayedToys, sortCriteria])

  // --- AUTH ---
  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) router.replace("/auth")
      else {
        setSession(data.session)
        setLoading(false)
      }
    }
    initSession()
  }, [router, supabase.auth])

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)
    }
    getUserId()
  }, [supabase.auth])

  // --- GESTION SUPPRESSION ---
  const handleDeleteRequest = useCallback((toyId: string) => {
    setToyToDeleteId(toyId)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!toyToDeleteId) return
    setIsDeleting(true)

    const toyId = toyToDeleteId
    const toyToDelete = toys.find(t => t.id === toyId)
    const toyName = toyToDelete?.nom || "Ce jouet"
    
    // UI Update
    setToys(prev => prev.filter(t => t.id !== toyId))
    removeToyImageUrl(toyId)
    if (isSearchActive) setSearchResults(prev => prev.filter(t => t.id !== toyId))
    if (toyToDelete) refreshCounts() 

    // Server Update
    const { error } = await supabase.from("toys").delete().eq("id", toyId)
    
    setIsDeleting(false)
    setToyToDeleteId(null)

    if (error) {
      showToast(`Erreur lors de la suppression de "${toyName}"`, "error")
    } else {
      showToast(`"${toyName}" a été supprimé définitivement`, "success")
    }
  }, [toyToDeleteId, toys, supabase, removeToyImageUrl, isSearchActive, refreshCounts, setToys, showToast])

  const handleSaveToy = useCallback((savedToy: Toy) => {
    updateCountsOptimistically(toyToEdit, savedToy);
    setToys(prev => {
        const matches = toyMatchesCurrentFilters(savedToy)
        if (!matches) return prev.filter(t => t.id !== savedToy.id) 
        
        const exists = prev.find(t => t.id === savedToy.id)
        if (exists) return prev.map(t => (t.id === savedToy.id ? savedToy : t))
        return [savedToy, ...prev]
    })

    if (savedToy.photo_url) {
        removeToyImageUrl(savedToy.id) 
    }

    if (isSearchActive) {
      setSearchResults(prev => {
        const exists = prev.find(t => t.id === savedToy.id)
        if (exists) return prev.map(t => (t.id === savedToy.id ? { ...savedToy, theme_name: theme.themeName } : t))
        return prev
      })
    }
    
    refreshCounts()
    
  }, [setToys, isSearchActive, theme.themeName, refreshCounts, updateCountsOptimistically, toyToEdit, toyMatchesCurrentFilters, removeToyImageUrl])

  const openModalForEdit = useCallback((toy: Toy) => {
    setToyToEdit(toy)
    setIsModalOpen(true)
  }, [])

  const openModalForAdd = useCallback(() => {
    setToyToEdit(null)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const getDisplayedToysCount = useCallback(() => {
    if (!isSearchActive) return toys.length
    if (searchResults.length === 1) return 1
    return searchResults.filter(toy => toy.theme_id === theme.themeId).length
  }, [isSearchActive, toys.length, searchResults, theme.themeId])

  // Pagination sur les jouets TRIÉS
  const totalItems = sortedToys.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedToys = sortedToys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const prenom = session.user.user_metadata?.first_name || "Utilisateur"

  return (
    <>
      <Navbar
        prenom={prenom}
        onSearchResults={handleSearchResults}
        themeId={theme.themeId}
        isGlobal={true}
      />
      <ScrollToTop />
      
      <FilterSidebar
        categories={categories}
        studios={studios}
        releaseYears={releaseYears}
        filters={filters}
        filterCounts={filterCounts}
        onToggleCategory={toggleCategory}
        onToggleStudio={toggleStudio}
        onNbPiecesChange={handleNbPiecesChange}
        onExposedChange={handleExposedChange}
        onSoonChange={handleSoonChange}
        onReleaseYearChange={handleReleaseYearChange}
        onResetFilters={resetFilters}
        onClearSearch={handleClearSearch}
        isSearchActive={isSearchActive}
        className="hidden lg:block"
      />

      <div className="min-h-[calc(100vh-64px)] relative">
        <main className="w-full lg:pl-96 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">           
            
            <ThemeHeader
              themeName={theme.themeName}
              filteredToysCount={getDisplayedToysCount()}
              totalToysCount={totalToys}
              showMobileFilters={showMobileFilters}
              onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
              view={view}
              onViewChange={handleViewChange}
            >
              <div className="flex flex-wrap items-center gap-3">
                
                {/* --- SÉLECTEUR DE TRI STYLISÉ --- */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                        <FontAwesomeIcon icon={faSort} />
                    </div>
                    <select
                        value={sortCriteria}
                        onChange={(e) => {
                            setSortCriteria(e.target.value as SortCriteria)
                            setCurrentPage(1)
                        }}
                        className="pl-9 pr-8 py-2.5 text-sm font-medium bg-secondary border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all duration-200 min-w-[180px]"
                        aria-label="Trier par"
                    >
                        <optgroup label="Date d'ajout">
                            <option value="added_desc">Ajoutés récemment</option>
                            <option value="added_asc">Ajoutés anciennement</option>
                        </optgroup>
                        <optgroup label="Année de sortie">
                            <option value="release_desc">Sortis récemment</option>
                            <option value="release_asc">Sortis anciennement</option>
                        </optgroup>
                    </select>
                </div>

                {/* --- SÉLECTEUR NOMBRE ITEMS STYLISÉ --- */}
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                        <FontAwesomeIcon icon={faListOl} />
                    </div>
                    <select 
                       value={itemsPerPage}
                       onChange={(e) => {
                         setItemsPerPage(Number(e.target.value))
                         setCurrentPage(1)
                       }}
                       className="pl-9 pr-8 py-2.5 text-sm font-medium bg-secondary border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all duration-200"
                       aria-label="Jouets par page"
                    >
                       <option value={12}>12 par page</option>
                       <option value={24}>24 par page</option>
                       <option value={48}>48 par page</option>
                    </select>
                </div>

                {/* Pagination Compacte */}
                {totalItems > itemsPerPage && (
                  <div className="hidden sm:block ml-2">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
                      onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      hasNextPage={currentPage < totalPages}
                      hasPreviousPage={currentPage > 1}
                    />
                  </div>
                )}
              </div>
            </ThemeHeader>

            <ToyGrid
              toys={paginatedToys}
              toyImageUrls={toyImageUrls}
              onEditToy={openModalForEdit}
              onDeleteToy={handleDeleteRequest}
              searchResults={searchResults}
              isSearchActive={isSearchActive}
              onClearSearch={handleClearSearch}
              currentThemeName={theme.themeName}
              currentUserId={currentUserId}
            />

            {totalItems > itemsPerPage && (
              <div className="flex justify-center pt-8 pb-20 lg:pb-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
                  onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  hasNextPage={currentPage < totalPages}
                  hasPreviousPage={currentPage > 1}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {showMobileFilters && (
        <FilterSidebar
          categories={categories}
          studios={studios}
          releaseYears={releaseYears}
          filters={filters}
          filterCounts={filterCounts}
          onToggleCategory={toggleCategory}
          onToggleStudio={toggleStudio}
          onNbPiecesChange={handleNbPiecesChange}
          onExposedChange={handleExposedChange}
          onSoonChange={handleSoonChange}
          onReleaseYearChange={handleReleaseYearChange}
          onResetFilters={resetFilters}
          onClearSearch={handleClearSearch}
          isSearchActive={isSearchActive}
          isMobile={true}
          onClose={() => setShowMobileFilters(false)}
        />
      )}

      <div className="hidden md:block fixed bottom-20 right-6 md:bottom-8 z-40 animate-in zoom-in duration-300">
        <button
          onClick={openModalForAdd}
          aria-label="Ajouter un jouet"
          className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-110 transition-all flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </button>
      </div>

      {isModalOpen && (
        <ToyModal
          isOpen={isModalOpen}
          themeId={theme.themeId}
          userId={theme.userId}
          toy={toyToEdit}
          onClose={closeModal}
          onSave={handleSaveToy}
        />
      )}

      <DeleteConfirmationModal
        isOpen={!!toyToDeleteId}
        onClose={() => setToyToDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Supprimer ce jouet ?"
        message={`Êtes-vous certain de vouloir supprimer "${toys.find(t => t.id === toyToDeleteId)?.nom || 'ce jouet'}" de votre collection ?`}
      />
    </>
  )
}
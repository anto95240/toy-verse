"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme"
import type { Session } from "@supabase/supabase-js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
import ToyModal from "@/components/toys/ToyModal"
import FilterSidebar from "@/components/filters/FilterSidebar"
import ToyGrid from "@/components/toyGrid/ToyGrid"
import ThemeHeader from "@/components/theme/ThemeHeader"
import Pagination from "@/components/common/Pagination"
import ScrollToTop from "@/components/common/ScrollToTop"
import { useToyFilters } from "@/hooks/useToyFilters"
import { useToyImages } from "@/hooks/useToyImages"
import { createSlug } from "@/lib/slugUtils"

interface Props {
  theme: {
    themeId: string
    themeName: string
    image_url: string | null
    toysCount: number
    userId: string
  }
}

export default function ToyPageClient({ theme }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseClient(), [])

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
  
  // NOUVEAU : État pour le nombre d'items par page
  const [itemsPerPage, setItemsPerPage] = useState(24)

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

  // --- LOGIQUE DETECTION ACTION URL (POUR BOTTOM NAV) ---
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add') {
      setToyToEdit(null)
      setIsModalOpen(true)
      // Nettoyer l'URL sans recharger
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

  const handleDeleteToy = useCallback(async (toyIdToDelete: string) => {
    if (!confirm("Confirmer la suppression de ce jouet ?")) return
    const toyToDelete = toys.find(t => t.id === toyIdToDelete);
    
    setToys(prev => prev.filter(t => t.id !== toyIdToDelete))
    removeToyImageUrl(toyIdToDelete)
    if (isSearchActive) setSearchResults(prev => prev.filter(t => t.id !== toyIdToDelete))
    
    if (toyToDelete) refreshCounts() 

    const { error } = await supabase.from("toys").delete().eq("id", toyIdToDelete)
    if (error) {
      alert("Erreur lors de la suppression")
      refreshCounts() 
    }
  }, [supabase, setToys, removeToyImageUrl, isSearchActive, refreshCounts, toys])

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

  // Pagination avec itemsPerPage dynamique
  const totalItems = displayedToys.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginatedToys = displayedToys.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
                {/* Sélecteur de nombre d'items */}
                <select 
                   value={itemsPerPage}
                   onChange={(e) => {
                     setItemsPerPage(Number(e.target.value))
                     setCurrentPage(1)
                   }}
                   className="px-2 py-1.5 text-sm bg-card border border-border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                   aria-label="Jouets par page"
                >
                   <option value={12}>12 par page</option>
                   <option value={24}>24 par page</option>
                </select>

                {totalItems > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))}
                    onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    hasNextPage={currentPage < totalPages}
                    hasPreviousPage={currentPage > 1}
                  />
                )}
              </div>
            </ThemeHeader>

            <ToyGrid
              toys={paginatedToys}
              toyImageUrls={toyImageUrls}
              onEditToy={openModalForEdit}
              onDeleteToy={handleDeleteToy}
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
          className="bg-primary text-primary-foreground w-10 h-10 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xl" />
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
    </>
  )
}
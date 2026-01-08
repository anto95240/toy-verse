"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  
  // CORRECTION : Stabilisation avec useMemo
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24

  // Hooks personnalisés
  const {
    toys,
    setToys,
    categories,
    studios,
    releaseYears,
    filters,
    filterCounts,
    totalToys,
    toggleCategory,
    toggleStudio,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    handleReleaseYearChange,
    resetFilters
  } = useToyFilters(theme.themeId, !!session)

  const { toyImageUrls, updateToyImageUrl, removeToyImageUrl } = useToyImages(toys, currentUserId)

  const handleViewChange = (newView: 'collection' | 'wishlist') => {
    setView(newView)
    handleSoonChange(newView === 'wishlist' ? true : false)
    setCurrentPage(1)
  }

  // Gérer la recherche depuis l'URL
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    const searchYear = searchParams.get('year')

    if (searchQuery && toys.length > 0) {
      const foundToy = toys.find(toy => 
        toy.nom.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (foundToy) {
        const toyWithTheme = { ...foundToy, theme_name: theme.themeName }
        setSearchResults([toyWithTheme])
        setIsSearchActive(true)
        router.replace(`/${createSlug(theme.themeName)}`, { scroll: false })
      }
    } else if (searchYear && toys.length > 0) {
      const foundToys = toys.filter(toy =>
        toy.release_date && new Date(toy.release_date).getFullYear().toString() === searchYear
      )
      const toysWithTheme = foundToys.map(toy => ({ ...toy, theme_name: theme.themeName }))
      setSearchResults(toysWithTheme)
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
    if (!isSearchActive) {
      return toys
    }
    if (searchResults.length === 1) {
      return searchResults
    }
    return searchResults.filter(toy => toy.theme_id === theme.themeId)
  }, [isSearchActive, toys, searchResults, theme.themeId])

  const displayedToys = getDisplayedToys()

  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/auth")
      } else {
        setSession(data.session)
        setLoading(false)
      }
    }
    initSession()
  }, [router, supabase.auth])

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getUserId()
  }, [supabase.auth])

  useEffect(() => {
    if (view === 'wishlist') {
      handleSoonChange(true)
    } else {
      handleSoonChange(false) 
    }
  }, [view, handleSoonChange])

  const handleDeleteToy = useCallback(async (toyIdToDelete: string) => {
    if (!confirm("Confirmer la suppression de ce jouet ?")) return

    const { error } = await supabase.from("toys").delete().eq("id", toyIdToDelete)
    if (error) {
      alert("Erreur lors de la suppression")
      console.error("Erreur suppression jouet:", error)
    } else {
      setToys(prev => prev.filter(t => t.id !== toyIdToDelete))
      removeToyImageUrl(toyIdToDelete)

      if (isSearchActive) {
        setSearchResults(prev => prev.filter(t => t.id !== toyIdToDelete))
      }
    }
  }, [supabase, setToys, removeToyImageUrl, isSearchActive])

  const handleSaveToy = useCallback((savedToy: Toy) => {
    setToys(prev => {
      const exists = prev.find(t => t.id === savedToy.id)
      if (exists) return prev.map(t => (t.id === savedToy.id ? savedToy : t))
      return [...prev, savedToy]
    })
    updateToyImageUrl(savedToy.id, savedToy.photo_url)

    if (isSearchActive) {
      setSearchResults(prev => {
        const exists = prev.find(t => t.id === savedToy.id)
        if (exists) return prev.map(t => (t.id === savedToy.id ? { ...savedToy, theme_name: theme.themeName } : t))
        return prev
      })
    }
  }, [setToys, updateToyImageUrl, isSearchActive, theme.themeName])

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
    if (!isSearchActive) {
      return toys.length
    }
    if (searchResults.length === 1) {
      return 1
    }
    return searchResults.filter(toy => toy.theme_id === theme.themeId).length
  }, [isSearchActive, toys.length, searchResults, theme.themeId])

  // --- Pagination Logic ---
  const totalItems = displayedToys.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const paginatedToys = displayedToys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading || !session) {
    return (
      <>
        <Navbar prenom="" />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </>
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

      <div className="fixed bottom-20 right-6 md:bottom-8 z-40 animate-in zoom-in duration-300">
        <button
          onClick={openModalForAdd}
          aria-label="Ajouter un jouet"
          className="bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center"
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
    </>
  )
}
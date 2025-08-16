"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/utils/supabase/client"
import { createSlug } from "@/lib/slugUtils"
import type { Toy } from "@/types/theme"
import type { Session } from "@supabase/supabase-js"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
import ToyModal from "@/components/toys/ToyModal"
import FilterSidebar from "@/components/filters/FilterSidebar"
import ToyGrid from "@/components/toyGrid/ToyGrid"
import ThemeHeader from "@/components/theme/ThemeHeader"

import ScrollToTop from "@/components/common/ScrollToTop"
import { useToyFilters } from "@/hooks/useToyFilters"
import { useToyImages } from "@/hooks/useToyImages"

interface Props {
  theme: {
    themeId: string
    themeName: string
    image_url: string | null
    toysCount: number
  }
}

export default function ToyPageClient({ theme }: Props) {
  const router = useRouter()
  const supabase = getSupabaseClient()

  // États
  const [session, setSession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toyToEdit, setToyToEdit] = useState<Toy | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>()

  // Hooks personnalisés
  const {
    toys,
    setToys,
    categories,
    filters,
    filterCounts,
    totalToys,
    toggleCategory,
    handleNbPiecesChange,
    handleExposedChange,
    handleSoonChange,
    resetFilters
  } = useToyFilters(theme.themeId, !!session)

  const { toyImageUrls, updateToyImageUrl, removeToyImageUrl } = useToyImages(toys, currentUserId)

  const handleSearchResults = useCallback((results: (Toy & { theme_name: string })[]) => {
    setSearchResults(results)
    setIsSearchActive(results.length > 0)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchResults([])
    setIsSearchActive(false)
  }, [])

  // CORRECTION : Fonction pour naviguer vers un autre thème via slug - utilisée dans la grille
  const navigateToTheme = useCallback((themeName: string) => {
    const slug = createSlug(themeName)
    router.push(`/${slug}`)
  }, [router])

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

  if (loading || !session) {
    return (
      <>
        <Navbar prenom="" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Chargement...</p>
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
      <main className="p-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 lg:pl-72">
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
            className="hidden lg:block w-64"
            onClearSearch={handleClearSearch}
            isSearchActive={isSearchActive}
          />

          {/* Section principale - liste des jouets */}
          <section className="flex-1 lg:ms-20">
            <ThemeHeader
              themeName={theme.themeName}
              filteredToysCount={getDisplayedToysCount()}
              totalToysCount={totalToys}
              showMobileFilters={showMobileFilters}
              onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
            />

            {/* Filtres mobile */}
            {showMobileFilters && (
              <FilterSidebar
                categories={categories}
                filters={filters}
                filterCounts={filterCounts}
                onToggleCategory={toggleCategory}
                onNbPiecesChange={handleNbPiecesChange}
                onExposedChange={handleExposedChange}
                onSoonChange={handleSoonChange}
                onResetFilters={resetFilters}
                onClearSearch={handleClearSearch}
                isSearchActive={isSearchActive}
                isMobile={true}
                onClose={() => setShowMobileFilters(false)}
              />
            )}

            {/* Grille des jouets - CORRECTION: Retirer onNavigateToTheme s'il n'est pas supporté */}
            <ToyGrid
              toys={displayedToys}
              toyImageUrls={toyImageUrls}
              onEditToy={openModalForEdit}
              onDeleteToy={handleDeleteToy}
              searchResults={searchResults}
              isSearchActive={isSearchActive}
              onClearSearch={handleClearSearch}
              currentThemeName={theme.themeName}
              currentUserId={currentUserId}
            />

            {/* Bouton flottant d'ajout */}
            <div className="fixed bottom-6 right-6">
              <button
                onClick={openModalForAdd}
                aria-label="nouveau jouet"
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
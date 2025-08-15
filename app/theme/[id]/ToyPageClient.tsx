"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/utils/supabase/client"
import type { Toy } from "@/types/theme"
import type { Session } from "@supabase/supabase-js"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import Navbar from "@/components/Navbar"
import ToyModal from "@/components/toys/ToyModal"
import FilterSidebar from "@/components/filters/FilterSidebar"
import ToyGrid from "@/components/toys/ToyGrid"
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
  const [isSearching, setIsSearching] = useState(false)

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

  const { toyImageUrls, updateToyImageUrl, removeToyImageUrl } = useToyImages(toys)

  // Gérer les résultats de recherche
  const handleSearchResults = (results: (Toy & { theme_name: string })[]) => {
    setSearchResults(results)
    setIsSearching(results.length > 0)
  }

  // Jouets à afficher selon la recherche ou les filtres
  const displayedToys = isSearching
    ? searchResults.filter(toy => toy.theme_id === theme.themeId)
    : toys

  // Chargement session et redirection si pas connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth")
      } else {
        setSession(data.session)
        setLoading(false)
      }
    })
  }, [router, supabase])

  // Supprimer un jouet
  async function handleDeleteToy(toyIdToDelete: string) {
    if (!confirm("Confirmer la suppression de ce jouet ?")) return

    const { error } = await supabase.from("toys").delete().eq("id", toyIdToDelete)
    if (error) {
      alert("Erreur lors de la suppression")
      console.error("Erreur suppression jouet:", error)
    } else {
      setToys(prev => prev.filter(t => t.id !== toyIdToDelete))
      removeToyImageUrl(toyIdToDelete)
    }
  }

  // Sauvegarder ajout/modif jouet
  function handleSaveToy(savedToy: Toy) {
    setToys(prev => {
      const exists = prev.find(t => t.id === savedToy.id)
      if (exists) return prev.map(t => (t.id === savedToy.id ? savedToy : t))
      return [...prev, savedToy]
    })
    updateToyImageUrl(savedToy.id, savedToy.photo_url)
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

  const prenom = session.user.user_metadata?.first_name || "Utilisateur"

  return (
    <>
      <Navbar
        prenom={prenom}
        onSearchResults={handleSearchResults}
        themeId={theme.themeId}
      />
      <ScrollToTop />
      <main className="main-content p-4 max-w-7xl">
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
          />

          {/* Section principale - liste des jouets */}
          <section className="flex-1">
            <ThemeHeader
              themeName={theme.themeName}
              filteredToysCount={displayedToys.length}
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
                isMobile={true}
                onClose={() => setShowMobileFilters(false)}
              />
            )}

            {/* Grille des jouets */}
            <ToyGrid
              toys={displayedToys}
              toyImageUrls={toyImageUrls}
              onEditToy={openModalForEdit}
              onDeleteToy={handleDeleteToy}
            />

            {/* Bouton flottant d'ajout */}
            <div className="fixed bottom-6 right-6">
              <button
                onClick={() => openModalForAdd()}
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
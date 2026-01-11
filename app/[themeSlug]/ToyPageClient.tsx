"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { getSupabaseClient } from "@/utils/supabase/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import type { Toy } from "@/types/theme"

// Components
import Navbar from "@/components/Navbar"
import ToyModal from "@/components/toys/ToyModal"
import FilterSidebar from "@/components/filters/FilterSidebar"
import ToyGrid from "@/components/toyGrid/ToyGrid"
import ThemeHeader from "@/components/theme/ThemeHeader"
import Pagination from "@/components/common/Pagination"
import ScrollToTop from "@/components/common/ScrollToTop"
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal"
import ToySortControls from "@/components/toyGrid/ToySortControls" // NOUVEAU

// Hooks
import { useToyFilters } from "@/hooks/useToyFilters"
import { useToyImages } from "@/hooks/useToyImages"
import { useToySorting } from "@/hooks/useToySorting" // NOUVEAU
import { useToast } from "@/context/ToastContext"
import { createSlug } from "@/lib/slugUtils"

interface Props {
  theme: { themeId: string; themeName: string; image_url: string | null; toysCount: number; userId: string }
}

export default function ToyPageClient({ theme }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const supabase = useMemo(() => getSupabaseClient(), [])
  const { showToast } = useToast()

  // --- États UI & Auth ---
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [view, setView] = useState<'collection' | 'wishlist'>('collection')
  
  // --- États Modals ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toyToEdit, setToyToEdit] = useState<Toy | null>(null)
  const [toyToDeleteId, setToyToDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // --- États Recherche ---
  const [searchResults, setSearchResults] = useState<(Toy & { theme_name: string })[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)

  // --- Custom Hooks ---
  const {
    toys, setToys, categories, studios, releaseYears, filters, filterCounts, totalToys,
    toggleCategory, toggleStudio, handleNbPiecesChange, handleExposedChange, handleSoonChange, handleReleaseYearChange, resetFilters,
    refreshCounts, updateCountsOptimistically
  } = useToyFilters(theme.themeId, !!session)

  const { toyImageUrls, removeToyImageUrl } = useToyImages(toys, currentUserId)

  // Utilisation du nouveau Hook de Tri/Pagination
  const {
    itemsPerPage, setItemsPerPage,
    currentPage, setCurrentPage,
    sortCriteria, setSortCriteria,
    paginatedToys, totalItems, totalPages, resetPage, displayedToysCount
  } = useToySorting(toys, searchResults, isSearchActive, theme.themeId)

  // --- Gestion du changement de filtre / vue ---
  useEffect(() => resetPage(), [filters, view, resetPage])
  
  useEffect(() => {
    if (filters.isSoon === true && view !== 'wishlist') setView('wishlist')
    else if (filters.isSoon === false && view !== 'collection') setView('collection')
  }, [filters.isSoon, view])

  const handleViewChange = (newView: 'collection' | 'wishlist') => {
    setView(newView)
    handleSoonChange(newView === 'wishlist')
  }

  // --- Gestion Recherche (Simplifiée) ---
  useEffect(() => {
    const query = searchParams.get('search');
    const year = searchParams.get('year');
    if ((query || year) && toys.length > 0) {
        // Logique de recherche initiale (peut être bougée dans un hook useToySearch si besoin)
        let found: Toy[] = [];
        if (query) found = toys.filter(t => t.nom.toLowerCase().includes(query.toLowerCase()));
        else if (year) found = toys.filter(t => new Date(t.release_date || '').getFullYear().toString() === year);
        
        if (found.length > 0) {
            setSearchResults(found.map(t => ({ ...t, theme_name: theme.themeName })));
            setIsSearchActive(true);
            router.replace(`/${createSlug(theme.themeName)}`, { scroll: false });
        }
    }
  }, [toys, searchParams, theme.themeName, router]);

  const handleSearchResults = useCallback((results: any[]) => {
    setSearchResults(results);
    setIsSearchActive(results.length > 0);
    resetPage();
  }, [resetPage]);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearchActive(false);
    resetPage();
  }, [resetPage]);

  // --- Gestion Suppression ---
  const handleConfirmDelete = async () => {
    if (!toyToDeleteId) return;
    setIsDeleting(true);
    const { error } = await supabase.from("toys").delete().eq("id", toyToDeleteId);
    
    if (!error) {
      setToys(prev => prev.filter(t => t.id !== toyToDeleteId));
      removeToyImageUrl(toyToDeleteId);
      if (isSearchActive) setSearchResults(prev => prev.filter(t => t.id !== toyToDeleteId));
      refreshCounts();
      showToast("Jouet supprimé", "success");
    } else {
      showToast("Erreur lors de la suppression", "error");
    }
    setIsDeleting(false);
    setToyToDeleteId(null);
  };

  // --- Gestion Sauvegarde ---
  const handleSaveToy = useCallback((savedToy: Toy) => {
    updateCountsOptimistically(toyToEdit, savedToy);
    // Logique de mise à jour locale...
    setToys(prev => {
        const exists = prev.find(t => t.id === savedToy.id);
        if (exists) return prev.map(t => (t.id === savedToy.id ? savedToy : t));
        return [savedToy, ...prev];
    });
    if (savedToy.photo_url) removeToyImageUrl(savedToy.id);
    refreshCounts();
  }, [toyToEdit, setToys, updateCountsOptimistically, removeToyImageUrl, refreshCounts]);

  // --- Auth & Init ---
  useEffect(() => {
    const init = async () => {
        const { data } = await supabase.auth.getSession();
        if (!data.session) router.replace("/auth");
        else {
            setSession(data.session);
            setCurrentUserId(data.session.user.id);
            setLoading(false);
        }
    }
    init();
  }, [router, supabase]);

  if (loading || !session) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <>
      <Navbar prenom={session.user.user_metadata?.first_name} onSearchResults={handleSearchResults} themeId={theme.themeId} isGlobal={true} />
      <ScrollToTop />
      
      <FilterSidebar
        categories={categories} studios={studios} releaseYears={releaseYears} filters={filters} filterCounts={filterCounts}
        onToggleCategory={toggleCategory} onToggleStudio={toggleStudio} onNbPiecesChange={handleNbPiecesChange}
        onExposedChange={handleExposedChange} onSoonChange={handleSoonChange} onReleaseYearChange={handleReleaseYearChange}
        onResetFilters={resetFilters} onClearSearch={handleClearSearch} isSearchActive={isSearchActive} className="hidden lg:block"
      />

      <div className="min-h-[calc(100vh-64px)] relative">
        <main className="w-full lg:pl-96 transition-all duration-300 ease-in-out">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">           
            
            <ThemeHeader
              themeName={theme.themeName} filteredToysCount={displayedToysCount} totalToysCount={totalToys}
              showMobileFilters={showMobileFilters} onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
              view={view} onViewChange={handleViewChange}
            >
              {/* Utilisation du nouveau composant UI */}
              <ToySortControls
                 sortCriteria={sortCriteria} setSortCriteria={setSortCriteria}
                 itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage}
                 currentPage={currentPage} setCurrentPage={setCurrentPage}
                 totalPages={totalPages} totalItems={totalItems}
              />
            </ThemeHeader>

            <ToyGrid
              toys={paginatedToys} toyImageUrls={toyImageUrls}
              onEditToy={(t) => { setToyToEdit(t); setIsModalOpen(true); }}
              onDeleteToy={setToyToDeleteId}
              searchResults={searchResults} isSearchActive={isSearchActive} onClearSearch={handleClearSearch}
              currentThemeName={theme.themeName} currentUserId={currentUserId}
            />

            {totalItems > itemsPerPage && (
              <div className="flex justify-center pt-8 pb-20 lg:pb-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} 
                   onPrevious={() => setCurrentPage(p => Math.max(1, p - 1))} onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   hasNextPage={currentPage < totalPages} hasPreviousPage={currentPage > 1}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {showMobileFilters && (
        <FilterSidebar
          // ... props inchangées, on pourrait aussi créer un context pour éviter ce prop drilling
          categories={categories} studios={studios} releaseYears={releaseYears} filters={filters} filterCounts={filterCounts}
          onToggleCategory={toggleCategory} onToggleStudio={toggleStudio} onNbPiecesChange={handleNbPiecesChange}
          onExposedChange={handleExposedChange} onSoonChange={handleSoonChange} onReleaseYearChange={handleReleaseYearChange}
          onResetFilters={resetFilters} onClearSearch={handleClearSearch} isSearchActive={isSearchActive}
          isMobile={true} onClose={() => setShowMobileFilters(false)}
        />
      )}

      <div className="hidden md:block fixed bottom-20 right-6 md:bottom-8 z-40 animate-in zoom-in duration-300">
        <button
          onClick={() => { setToyToEdit(null); setIsModalOpen(true); }}
          aria-label="Ajouter un jouet" // <--- AJOUT ICI
          className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </button>
      </div>

      {isModalOpen && (
        <ToyModal isOpen={isModalOpen} themeId={theme.themeId} userId={theme.userId} toy={toyToEdit} onClose={() => setIsModalOpen(false)} onSave={handleSaveToy} />
      )}

      <DeleteConfirmationModal
        isOpen={!!toyToDeleteId} onClose={() => setToyToDeleteId(null)} onConfirm={handleConfirmDelete} isDeleting={isDeleting}
        title="Supprimer ce jouet ?" message={`Êtes-vous certain de vouloir supprimer ce jouet ?`}
      />
    </>
  )
}
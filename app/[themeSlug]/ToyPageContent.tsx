"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSlug } from "@/utils/slugUtils";
import type { Toy } from "@/types/theme";
import type { Filters } from "@/hooks/toys/useFilterActions";
import type { FilterCounts } from "@/hooks/toys/useFilterCounts";

import FilterSidebar from "@/components/filters/FilterSidebar";
import ToyGrid from "@/components/toyGrid/ToyGrid";
import ThemeHeader from "@/components/theme/ThemeHeader";
import Pagination from "@/components/common/Pagination";
import ToySortControls from "@/components/toyGrid/ToySortControls";

import { useToySorting } from "@/hooks/toys/useToySorting";

interface ToyPageContentProps {
  theme: {
    themeId: string;
    themeName: string;
  };
  toys: Toy[];
  categories: string[];
  studios: string[];
  releaseYears: string[];
  filters: Filters;
  filterCounts: FilterCounts;
  totalToys: number;
  toyImageUrls: Record<string, string>;
  currentUserId?: string;
  onToggleCategory: (cat: string) => void;
  onToggleStudio: (studio: string) => void;
  onNbPiecesChange: (range: string) => void;
  onExposedChange: (val: boolean | null) => void;
  onSoonChange: (val: boolean | null) => void;
  onReleaseYearChange: (year: string) => void;
  onResetFilters: () => void;
  onEditToy: (toy: Toy) => void;
  onDeleteToy: (toyId: string) => void;
}

export default function ToyPageContent({
  theme,
  toys,
  categories,
  studios,
  releaseYears,
  filters,
  filterCounts,
  totalToys,
  toyImageUrls,
  currentUserId,
  onToggleCategory,
  onToggleStudio,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onReleaseYearChange,
  onResetFilters,
  onEditToy,
  onDeleteToy,
}: ToyPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [view, setView] = useState<"collection" | "wishlist">("collection");
  const [selectedToyId, setSelectedToyId] = useState<string | null>(null);
  const selectedToyAppliedRef = useRef(false);

  // ✅ Préparer les données pour useToySorting avec le bon type
  const selectedToyData: (Toy & { theme_name: string })[] = selectedToyId 
    ? (() => {
        const toy = toys.find(t => t.id === selectedToyId);
        return toy ? [{ ...toy, theme_name: theme.themeName }] : [];
      })()
    : toys.map(t => ({ ...t, theme_name: theme.themeName }));

  const {
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    sortCriteria,
    setSortCriteria,
    paginatedToys,
    totalItems,
    totalPages,
    resetPage,
    displayedToysCount,
  } = useToySorting(selectedToyData, selectedToyId ? selectedToyData : [], selectedToyId !== null, theme.themeId);

  // Reset page on filter/view change
  useEffect(() => resetPage(), [filters, view, resetPage]);

  // Handle view change with filter sync
  useEffect(() => {
    if (filters.isSoon === true && view !== "wishlist") setView("wishlist");
    else if (filters.isSoon === false && view !== "collection") setView("collection");
  }, [filters.isSoon, view]);

  const handleViewChange = (newView: "collection" | "wishlist") => {
    setView(newView);
    onSoonChange(newView === "wishlist");
  };

  // ✅ Réinitialiser la ref quand le thème change
  useEffect(() => {
    selectedToyAppliedRef.current = false;
  }, [theme.themeId]);

  // ✅ Appliquer le selectedToyId UNE SEULE FOIS avec une clé stable
  const selectedToyIdParam = searchParams.get("selectedToyId");
  
  useEffect(() => {
    // Réinitialiser la ref si le selectedToyIdParam change VERS une nouvelle valeur
    if (selectedToyIdParam) {
      selectedToyAppliedRef.current = false;
    }
  }, [selectedToyIdParam]);

  useEffect(() => {
    if (!selectedToyIdParam) {
      // Pas de jouet sélectionné
      setSelectedToyId(null);
      selectedToyAppliedRef.current = false;
      return;
    }

    // Si déjà appliqué, ne pas réappliquer
    if (selectedToyAppliedRef.current) {
      return;
    }

    // Attendre que les toys aient chargé
    if (toys.length === 0) {
      return;
    }

    // Vérifier que le jouet existe dans ce thème
    const toy = toys.find(t => t.id === selectedToyIdParam);
    if (toy) {
      setSelectedToyId(selectedToyIdParam);
      selectedToyAppliedRef.current = true;
    }
  }, [selectedToyIdParam, toys]);

  const handleClearSelection = useCallback(() => {
    setSelectedToyId(null);
    selectedToyAppliedRef.current = false;
    const currentThemeSlug = createSlug(theme.themeName);
    router.replace(`/${currentThemeSlug}`, { scroll: false });
    resetPage();
  }, [resetPage, theme.themeName, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      <FilterSidebar
        categories={categories}
        studios={studios}
        releaseYears={releaseYears}
        filters={filters}
        filterCounts={filterCounts}
        onToggleCategory={onToggleCategory}
        onToggleStudio={onToggleStudio}
        onNbPiecesChange={onNbPiecesChange}
        onExposedChange={onExposedChange}
        onSoonChange={onSoonChange}
        onReleaseYearChange={onReleaseYearChange}
        onResetFilters={onResetFilters}
        onClearSearch={handleClearSelection}
        isSearchActive={selectedToyId !== null}
        className="hidden 2xl:block"
        filteredCount={displayedToysCount}
      />

      <main className="w-full 2xl:pl-96 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          <ThemeHeader
            themeName={theme.themeName}
            filteredToysCount={displayedToysCount}
            totalToysCount={totalToys}
            showMobileFilters={showMobileFilters}
            onToggleMobileFilters={() => setShowMobileFilters(!showMobileFilters)}
            view={view}
            onViewChange={handleViewChange}
            isSearchActive={selectedToyId !== null}
            onClearSearch={handleClearSelection}
          >
            <ToySortControls
              sortCriteria={sortCriteria}
              setSortCriteria={setSortCriteria}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
            />
          </ThemeHeader>

          {/* Pagination au-dessus - visible sur mobile seulement */}
          {totalItems > itemsPerPage && (
            <div className="flex justify-center py-2 md:hidden">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                hasNextPage={currentPage < totalPages}
                hasPreviousPage={currentPage > 1}
              />
            </div>
          )}

          <ToyGrid
            toys={paginatedToys}
            toyImageUrls={toyImageUrls}
            onEditToy={onEditToy}
            onDeleteToy={onDeleteToy}
            searchResults={selectedToyId ? selectedToyData : []}
            isSearchActive={selectedToyId !== null}
            onClearSearch={handleClearSelection}
            currentThemeName={theme.themeName}
            currentUserId={currentUserId}
          />

          {/* Pagination au-dessous - visible partout */}
          {totalItems > itemsPerPage && (
            <div className="flex justify-center py-4 md:py-6 pb-safe">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                hasNextPage={currentPage < totalPages}
                hasPreviousPage={currentPage > 1}
              />
            </div>
          )}
        </div>
      </main>

      {showMobileFilters && (
        <FilterSidebar
          categories={categories}
          studios={studios}
          releaseYears={releaseYears}
          filters={filters}
          filterCounts={filterCounts}
          onToggleCategory={onToggleCategory}
          onToggleStudio={onToggleStudio}
          onNbPiecesChange={onNbPiecesChange}
          onExposedChange={onExposedChange}
          onSoonChange={onSoonChange}
          onReleaseYearChange={onReleaseYearChange}
          onResetFilters={onResetFilters}
          onClearSearch={handleClearSelection}
          isSearchActive={selectedToyId !== null}
          isMobile={true}
          onClose={() => setShowMobileFilters(false)}
          filteredCount={displayedToysCount}
        />
      )}
    </div>
  );
}


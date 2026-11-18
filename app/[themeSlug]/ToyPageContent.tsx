"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import type { SortCriteria } from "@/utils/themeViewQuery";
import { buildThemeViewSearch } from "@/utils/themeViewQuery";

interface ToyPageContentProps {
  theme: {
    themeId: string;
    themeName: string;
  };
  toys: Toy[];
  categories: string[];
  subcategories: string[];
  studios: string[];
  locations: string[];
  releaseYears: string[];
  giftYears?: string[];
  filters: Filters;
  filterCounts: FilterCounts;
  totalToys: number;
  toysLoading?: boolean;
  catalog?: Toy[];
  initialPage?: number;
  initialSort?: SortCriteria;
  initialPerPage?: number;
  toyImageUrls: Record<string, string>;
  currentUserId?: string;
  onToggleCategory: (cat: string) => void;
  onToggleSubcategory: (sub: string) => void;
  onToggleStudio: (studio: string) => void;
  onToggleLocation: (location: string) => void;
  onNbPiecesChange: (range: string) => void;
  onExposedChange: (val: boolean | null) => void;
  onSoonChange: (val: boolean | null) => void;
  onReleaseYearChange: (year: string) => void;
  onGiftOccasionChange: (occasion: string) => void;
  onGiftYearChange: (year: string) => void;
  onResetFilters: () => void;
  onEditToy: (toy: Toy) => void;
  onDeleteToy: (toyId: string) => void;
}

export default function ToyPageContent({
  theme,
  toys,
  categories,
  subcategories,
  studios,
  locations,
  releaseYears,
  giftYears = [],
  filters,
  filterCounts,
  totalToys,
  toysLoading = false,
  catalog,
  initialPage,
  initialSort,
  initialPerPage,
  toyImageUrls,
  currentUserId,
  onToggleCategory,
  onToggleSubcategory,
  onToggleStudio,
  onToggleLocation,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onReleaseYearChange,
  onGiftOccasionChange,
  onGiftYearChange,
  onResetFilters,
  onEditToy,
  onDeleteToy,
}: ToyPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [view, setView] = useState<"collection" | "wishlist">(
    filters.isSoon === true ? "wishlist" : "collection"
  );
  const [selectedToyId, setSelectedToyId] = useState<string | null>(null);
  const selectedToyAppliedRef = useRef(false);

  const lookupToys = catalog ?? toys;

  const selectedToyData: (Toy & { theme_name: string })[] = useMemo(() => {
    if (!selectedToyId) {
      return toys.map((toy) => ({ ...toy, theme_name: theme.themeName }));
    }
    const toy = lookupToys.find((item) => item.id === selectedToyId);
    return toy ? [{ ...toy, theme_name: theme.themeName }] : [];
  }, [selectedToyId, toys, lookupToys, theme.themeName]);

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
  } = useToySorting(
    selectedToyData,
    selectedToyId ? selectedToyData : [],
    selectedToyId !== null,
    theme.themeId,
    { page: initialPage, sort: initialSort, perPage: initialPerPage }
  );

  const navigationKey = `${view}::${JSON.stringify(filters)}`;
  const navigationKeyRef = useRef(navigationKey);
  // Revenir en page 1 seulement quand les filtres ou la vue changent vraiment.
  // La clé initiale est posée au rendu, donc un rechargement sur ?page=2 reste en page 2.
  useEffect(() => {
    if (navigationKeyRef.current === navigationKey) return;
    navigationKeyRef.current = navigationKey;
    resetPage();
  }, [navigationKey, resetPage]);

  useEffect(() => {
    if (selectedToyId) return;
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [selectedToyId, totalPages, currentPage, setCurrentPage]);

  const lastScrolledPage = useRef(currentPage);
  useEffect(() => {
    if (lastScrolledPage.current === currentPage) return;
    lastScrolledPage.current = currentPage;
    document.querySelector("main")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentPage]);

  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const next = buildThemeViewSearch(
      {
        filters,
        page: currentPage,
        sort: sortCriteria,
        perPage: itemsPerPage,
      },
      current
    );
    const nextUrl = next
      ? `${window.location.pathname}?${next}`
      : window.location.pathname;
    const now = `${window.location.pathname}${window.location.search}`;
    if (now !== nextUrl) {
      window.history.replaceState(window.history.state, "", nextUrl);
    }
  }, [filters, currentPage, sortCriteria, itemsPerPage]);

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
    if (lookupToys.length === 0) {
      return;
    }

    // Vérifier que le jouet existe dans ce thème
    const toy = lookupToys.find(t => t.id === selectedToyIdParam);
    if (toy) {
      setSelectedToyId(selectedToyIdParam);
      selectedToyAppliedRef.current = true;
    }
  }, [selectedToyIdParam, lookupToys]);

  const handleClearSelection = useCallback(() => {
    setSelectedToyId(null);
    selectedToyAppliedRef.current = false;
    const params = new URLSearchParams(window.location.search);
    params.delete("selectedToyId");
    const query = params.toString();
    const currentThemeSlug = createSlug(theme.themeName);
    router.replace(
      query ? `/${currentThemeSlug}?${query}` : `/${currentThemeSlug}`,
      { scroll: false }
    );
  }, [theme.themeName, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      <FilterSidebar
        categories={categories}
        subcategories={subcategories}
        studios={studios}
        locations={locations}
        releaseYears={releaseYears}
        giftYears={giftYears}
        filters={filters}
        filterCounts={filterCounts}
        onToggleCategory={onToggleCategory}
        onToggleSubcategory={onToggleSubcategory}
        onToggleStudio={onToggleStudio}
        onToggleLocation={onToggleLocation}
        onNbPiecesChange={onNbPiecesChange}
        onExposedChange={onExposedChange}
        onSoonChange={onSoonChange}
        onReleaseYearChange={onReleaseYearChange}
        onGiftOccasionChange={onGiftOccasionChange}
        onGiftYearChange={onGiftYearChange}
        onResetFilters={onResetFilters}
        onClearSearch={handleClearSelection}
        isSearchActive={selectedToyId !== null}
        className="hidden 2xl:block"
        filteredCount={displayedToysCount}
        themeName={theme.themeName}
      />

      <main className="w-full 2xl:pl-96">
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
            isLoading={toysLoading}
            isFiltered={
              filters.categories.length > 0 ||
              filters.subcategories.length > 0 ||
              filters.studios.length > 0 ||
              filters.locations.length > 0 ||
              !!filters.nbPiecesRange ||
              filters.isExposed !== null ||
              filters.isSoon !== null ||
              !!filters.releaseYear ||
              !!filters.giftOccasion ||
              !!filters.giftYear
            }
            onResetFilters={onResetFilters}
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
          subcategories={subcategories}
          studios={studios}
          locations={locations}
          releaseYears={releaseYears}
          giftYears={giftYears}
          filters={filters}
          filterCounts={filterCounts}
          onToggleCategory={onToggleCategory}
          onToggleSubcategory={onToggleSubcategory}
          onToggleStudio={onToggleStudio}
          onToggleLocation={onToggleLocation}
          onNbPiecesChange={onNbPiecesChange}
          onExposedChange={onExposedChange}
          onSoonChange={onSoonChange}
          onReleaseYearChange={onReleaseYearChange}
          onGiftOccasionChange={onGiftOccasionChange}
          onGiftYearChange={onGiftYearChange}
          onResetFilters={onResetFilters}
          onClearSearch={handleClearSelection}
          isSearchActive={selectedToyId !== null}
          isMobile={true}
          onClose={() => setShowMobileFilters(false)}
          filteredCount={displayedToysCount}
          themeName={theme.themeName}
        />
      )}
    </div>
  );
}


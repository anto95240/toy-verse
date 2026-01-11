import React, { useState } from "react";
import MultiSelectFilter from "./MultiSelectFilter";
import SingleSelectFilter from "./SingleSelectFilter";
import BooleanFilter from "./BooleanFilter";
import SearchResetButton from "./SearchResetButton";
import { FilterStats } from "@/components/filters/FilterStats";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import type { FilterContentProps } from "@/types/filters";
import {
  faTags,
  faBuilding,
  faCubes,
  faCalendarAlt,
  faEye,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

export default function FilterContent({
  categories,
  studios,
  releaseYears,
  filters,
  filterCounts,
  onToggleCategory,
  onToggleStudio,
  onNbPiecesChange,
  onExposedChange,
  onSoonChange,
  onReleaseYearChange,
  onResetFilters,
  onClearSearch,
  isSearchActive = false,
  isMobile = false,
  onClose,
}: FilterContentProps) {
  const [collapsed, setCollapsed] = useState({
    cats: true,
    studios: true,
    pieces: true,
    year: true,
    expo: true,
    soon: true,
  });
  const toggle = (k: keyof typeof collapsed) =>
    setCollapsed((p) => ({ ...p, [k]: !p[k] }));

  const piecesOptions = [
    { value: "0-200", label: "0 - 200 pièces" },
    { value: "201-500", label: "201 - 500 pièces" },
    { value: "501-1000", label: "501 - 1000 pièces" },
    { value: "1001-1500", label: "1001 - 1500 pièces" },
    { value: "1501-2000", label: "1501 - 2000 pièces" },
    { value: "2000+", label: "2000+ pièces" },
    { value: "", label: "Toutes les tailles" },
  ];
  const yearOptions = [
    ...releaseYears
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((y) => ({ value: y, label: `${y}` })),
    { value: "", label: "Toutes" },
  ];
  const exposureOptions = [
    { value: true, label: "Exposé" },
    { value: false, label: "Non exposé" },
    { value: null, label: "Tous" },
  ];
  const soonOptions = [
    { value: true, label: "Prochainement" },
    { value: false, label: "Pas prochainement" },
    { value: null, label: "Tous" },
  ];

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.studios.length > 0 ||
    filters.nbPiecesRange ||
    filters.isExposed !== null ||
    filters.isSoon !== null ||
    filters.releaseYear;

  return (
    <>
      <SearchResetButton
        isSearchActive={isSearchActive}
        onClearSearch={onClearSearch}
        isMobile={isMobile}
        onClose={onClose}
      />

      <FilterStats
        totalToys={filterCounts.totalToys || 0}
        totalWithYear={Object.values(filterCounts.releaseYears).reduce(
          (a, b) => a + b,
          0
        )}
      />

      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onReset={onResetFilters}
          actions={{
            toggleCat: onToggleCategory,
            toggleStudio: onToggleStudio,
            setPieces: onNbPiecesChange,
            setYear: onReleaseYearChange,
            setExposed: onExposedChange,
            setSoon: onSoonChange,
          }}
        />
      )}

      <MultiSelectFilter
        title="Catégories"
        colorScheme="blue"
        icon={faTags}
        items={categories}
        selectedItems={filters.categories}
        onToggleItem={onToggleCategory}
        filterCounts={filterCounts.categories}
        isCollapsed={collapsed.cats}
        onToggleCollapse={() => toggle("cats")}
        searchable
      />
      <MultiSelectFilter
        title="Studios"
        colorScheme="green"
        icon={faBuilding}
        items={studios}
        selectedItems={filters.studios}
        onToggleItem={onToggleStudio}
        filterCounts={filterCounts.studios}
        isCollapsed={collapsed.studios}
        onToggleCollapse={() => toggle("studios")}
        searchable
      />
      <SingleSelectFilter
        title="Pièces"
        colorScheme="purple"
        icon={faCubes}
        options={piecesOptions}
        selectedValue={filters.nbPiecesRange}
        onValueChange={onNbPiecesChange}
        filterCounts={filterCounts.nbPiecesRanges}
        isCollapsed={collapsed.pieces}
        onToggleCollapse={() => toggle("pieces")}
      />
      <SingleSelectFilter
        title="Année"
        colorScheme="indigo"
        icon={faCalendarAlt}
        options={yearOptions}
        selectedValue={filters.releaseYear || ""}
        onValueChange={onReleaseYearChange}
        filterCounts={filterCounts.releaseYears}
        isCollapsed={collapsed.year}
        onToggleCollapse={() => toggle("year")}
      />
      <BooleanFilter
        title="Exposition"
        colorScheme="orange"
        icon={faEye}
        options={exposureOptions}
        selectedValue={filters.isExposed}
        onValueChange={onExposedChange}
        filterCounts={filterCounts.exposed}
        isCollapsed={collapsed.expo}
        onToggleCollapse={() => toggle("expo")}
      />
      <BooleanFilter
        title="Disponibilité"
        colorScheme="red"
        icon={faClock}
        options={soonOptions}
        selectedValue={filters.isSoon}
        onValueChange={onSoonChange}
        filterCounts={filterCounts.soon}
        isCollapsed={collapsed.soon}
        onToggleCollapse={() => toggle("soon")}
      />
    </>
  );
}

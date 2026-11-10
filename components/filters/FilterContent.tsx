import React, { useMemo, useState } from "react";
import MultiSelectFilter from "./MultiSelectFilter";
import SingleSelectFilter from "./SingleSelectFilter";
import BooleanFilter from "./BooleanFilter";
import SearchResetButton from "./SearchResetButton";
import { FilterStats } from "@/components/filters/FilterStats";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import type { FilterContentProps } from "@/types/filters";
import {
  GIFT_OCCASIONS,
  getThemeProfile,
  releaseYearLabel,
  themeHasOccasionYear,
} from "@/lib/themeProfile";

export default function FilterContent({
  categories,
  subcategories = [],
  studios,
  locations = [],
  releaseYears,
  giftYears = [],
  filters,
  filterCounts,
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
  onClearSearch,
  isSearchActive = false,
  isMobile = false,
  onClose,
  themeName,
}: FilterContentProps) {
  const profile = useMemo(() => getThemeProfile(themeName || ""), [themeName]);
  const showPieces = !profile.hiddenFields.includes("nb_pieces");
  const showStudios = !profile.hiddenFields.includes("studio");
  const showLocations = !profile.hiddenFields.includes("location");
  const showOccasion = themeHasOccasionYear(themeName || "");

  const [collapsed, setCollapsed] = useState({
    cats: false,
    subs: true,
    studios: true,
    locations: true,
    pieces: true,
    year: true,
    occasion: true,
    giftYear: true,
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
  const occasionOptions = [
    ...GIFT_OCCASIONS.map((item) => ({ value: item.id, label: item.label })),
    { value: "", label: "Toutes" },
  ];
  const giftYearOptions = [
    ...giftYears.map((year) => ({ value: year, label: year })),
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
    (filters.subcategories?.length || 0) > 0 ||
    filters.studios.length > 0 ||
    (filters.locations?.length || 0) > 0 ||
    filters.nbPiecesRange ||
    filters.isExposed !== null ||
    filters.isSoon !== null ||
    filters.releaseYear ||
    !!filters.giftOccasion ||
    !!filters.giftYear;

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
        groups={[
          { label: "Catégories", count: categories.length },
          { label: "Sous-cat.", count: subcategories.length },
          ...(showStudios ? [{ label: "Marques", count: studios.length }] : []),
          ...(showLocations ? [{ label: "Lieux", count: locations.length }] : []),
          { label: "Années", count: releaseYears.length },
          ...(showOccasion
            ? [{ label: "Occasions", count: GIFT_OCCASIONS.length }]
            : []),
        ].filter((group) => group.count > 0)}
      />

      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onReset={onResetFilters}
          actions={{
            toggleCat: onToggleCategory,
            toggleSub: onToggleSubcategory || (() => {}),
            toggleStudio: onToggleStudio,
            toggleLocation: onToggleLocation || (() => {}),
            setPieces: onNbPiecesChange,
            setYear: onReleaseYearChange,
            setOccasion: onGiftOccasionChange || (() => {}),
            setGiftYear: onGiftYearChange || (() => {}),
            setExposed: onExposedChange,
            setSoon: onSoonChange,
          }}
        />
      )}

      <MultiSelectFilter
        title="Catégories"
        colorScheme="blue"
        items={categories}
        selectedItems={filters.categories}
        onToggleItem={onToggleCategory}
        filterCounts={filterCounts.categories}
        isCollapsed={collapsed.cats}
        onToggleCollapse={() => toggle("cats")}
        searchable
      />

      {subcategories.length > 0 && onToggleSubcategory && (
        <MultiSelectFilter
          title="Sous-catégories"
          colorScheme="indigo"
          items={subcategories}
          selectedItems={filters.subcategories || []}
          onToggleItem={onToggleSubcategory}
          filterCounts={filterCounts.subcategories || {}}
          isCollapsed={collapsed.subs}
          onToggleCollapse={() => toggle("subs")}
          searchable
        />
      )}

      {showStudios && (
        <MultiSelectFilter
          title="Studios / Marques"
          colorScheme="green"
          items={studios}
          selectedItems={filters.studios}
          onToggleItem={onToggleStudio}
          filterCounts={filterCounts.studios}
          isCollapsed={collapsed.studios}
          onToggleCollapse={() => toggle("studios")}
          searchable
        />
      )}

      {showLocations && locations.length > 0 && onToggleLocation && (
        <MultiSelectFilter
          title="Lieux"
          colorScheme="orange"
          items={locations}
          selectedItems={filters.locations || []}
          onToggleItem={onToggleLocation}
          filterCounts={filterCounts.locations || {}}
          isCollapsed={collapsed.locations}
          onToggleCollapse={() => toggle("locations")}
          searchable
        />
      )}

      {showPieces && (
        <SingleSelectFilter
          title="Pièces"
          colorScheme="purple"
          options={piecesOptions}
          selectedValue={filters.nbPiecesRange}
          onValueChange={onNbPiecesChange}
          filterCounts={filterCounts.nbPiecesRanges}
          isCollapsed={collapsed.pieces}
          onToggleCollapse={() => toggle("pieces")}
        />
      )}

      <SingleSelectFilter
        title={releaseYearLabel(themeName || "")}
        colorScheme="indigo"
        options={yearOptions}
        selectedValue={filters.releaseYear || ""}
        onValueChange={onReleaseYearChange}
        filterCounts={filterCounts.releaseYears}
        isCollapsed={collapsed.year}
        onToggleCollapse={() => toggle("year")}
      />

      {showOccasion && onGiftOccasionChange && (
        <SingleSelectFilter
          title="Occasion"
          colorScheme="orange"
          options={occasionOptions}
          selectedValue={filters.giftOccasion || ""}
          onValueChange={onGiftOccasionChange}
          filterCounts={filterCounts.giftOccasions || {}}
          isCollapsed={collapsed.occasion}
          onToggleCollapse={() => toggle("occasion")}
        />
      )}

      {showOccasion && onGiftYearChange && giftYears.length > 0 && (
        <SingleSelectFilter
          title="Année de l'occasion"
          colorScheme="orange"
          options={giftYearOptions}
          selectedValue={filters.giftYear || ""}
          onValueChange={onGiftYearChange}
          filterCounts={filterCounts.giftYears || {}}
          isCollapsed={collapsed.giftYear}
          onToggleCollapse={() => toggle("giftYear")}
        />
      )}

      <BooleanFilter
        title="Exposition"
        colorScheme="orange"
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

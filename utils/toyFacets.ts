import type { Toy } from "@/types/theme";
import type { FilterCounts, Filters } from "@/types/filters";
import { formatReleaseYear, isGiftOccasion } from "@/lib/themeProfile";

type NameSets = {
  categories: string[];
  subcategories: string[];
  studios: string[];
  locations: string[];
};

const PIECE_RANGES = [
  { key: "0-200", min: 0, max: 200 },
  { key: "201-500", min: 201, max: 500 },
  { key: "501-1000", min: 501, max: 1000 },
  { key: "1001-1500", min: 1001, max: 1500 },
  { key: "1501-2000", min: 1501, max: 2000 },
  { key: "2000+", min: 2000, max: null as number | null },
];

function toyNameSets(toy: Toy): NameSets {
  const v2 = toy.v2_data as
    | {
        category_ids?: { name?: string }[];
        studio_ids?: { name?: string }[];
        location_ids?: { name?: string }[];
      }
    | undefined;

  const categories = [v2?.category_ids?.[0]?.name, toy.categorie].filter(
    Boolean
  ) as string[];
  const subcategories = [v2?.category_ids?.[1]?.name].filter(Boolean) as string[];
  const studios = [
    ...(v2?.studio_ids?.map((studio) => studio?.name) ?? []),
    toy.studio,
  ].filter(Boolean) as string[];
  const locations = (v2?.location_ids?.map((location) => location?.name) ?? []).filter(
    Boolean
  ) as string[];

  return { categories, subcategories, studios, locations };
}

function matchesPieces(value: number, range: string): boolean {
  const found = PIECE_RANGES.find((item) => item.key === range);
  if (!found) return true;
  if (value < found.min) return false;
  if (found.max != null && value > found.max) return false;
  return true;
}

type Dim =
  | "categories"
  | "subcategories"
  | "studios"
  | "locations"
  | "pieces"
  | "exposed"
  | "soon"
  | "year"
  | "occasion"
  | "giftYear";

const DIMS: Dim[] = [
  "categories",
  "subcategories",
  "studios",
  "locations",
  "pieces",
  "exposed",
  "soon",
  "year",
  "occasion",
  "giftYear",
];

function predicates(toy: Toy, filters: Filters): Record<Dim, boolean> {
  const names = toyNameSets(toy);
  const categoryPool = [...names.categories, ...names.subcategories];

  return {
    categories:
      filters.categories.length === 0 ||
      filters.categories.some((name) => categoryPool.includes(name)),
    subcategories:
      filters.subcategories.length === 0 ||
      filters.subcategories.some((name) => categoryPool.includes(name)),
    studios:
      filters.studios.length === 0 ||
      filters.studios.some((name) => names.studios.includes(name)),
    locations:
      filters.locations.length === 0 ||
      filters.locations.some((name) => names.locations.includes(name)),
    pieces:
      !filters.nbPiecesRange ||
      (toy.nb_pieces != null && matchesPieces(toy.nb_pieces, filters.nbPiecesRange)),
    exposed: filters.isExposed === null || toy.is_exposed === filters.isExposed,
    soon: filters.isSoon === null || toy.is_soon === filters.isSoon,
    year:
      !filters.releaseYear ||
      formatReleaseYear(toy.release_date) === filters.releaseYear,
    occasion:
      !filters.giftOccasion ||
      (isGiftOccasion(toy.gift_occasion) && toy.gift_occasion === filters.giftOccasion),
    giftYear:
      !filters.giftYear || formatReleaseYear(toy.gift_year) === filters.giftYear,
  };
}

export function toyMatchesFilters(toy: Toy, filters: Filters): boolean {
  const result = predicates(toy, filters);
  return DIMS.every((dim) => result[dim]);
}

function bump(map: Record<string, number>, names: string[]) {
  for (const name of new Set(names)) {
    if (!name) continue;
    map[name] = (map[name] || 0) + 1;
  }
}

/** Compteurs de facettes calculés en mémoire, une passe par jouet. */
export function computeFacetCounts(toys: Toy[], filters: Filters): FilterCounts {
  const counts: FilterCounts = {
    categories: {},
    subcategories: {},
    studios: {},
    locations: {},
    nbPiecesRanges: {},
    exposed: {},
    soon: {},
    releaseYears: {},
    giftOccasions: {},
    giftYears: {},
    totalToys: toys.length,
  };

  for (const toy of toys) {
    const result = predicates(toy, filters);
    const names = toyNameSets(toy);
    const failed = DIMS.filter((dim) => !result[dim]);
    const passesExcept = (dim: Dim) => failed.every((item) => item === dim);

    if (passesExcept("categories")) bump(counts.categories, names.categories);
    if (passesExcept("subcategories")) bump(counts.subcategories ?? {}, names.subcategories);
    if (passesExcept("studios")) bump(counts.studios, names.studios);
    if (passesExcept("locations")) bump(counts.locations ?? {}, names.locations);

    if (passesExcept("pieces") && toy.nb_pieces != null) {
      for (const range of PIECE_RANGES) {
        if (!matchesPieces(toy.nb_pieces, range.key)) continue;
        counts.nbPiecesRanges[range.key] = (counts.nbPiecesRanges[range.key] || 0) + 1;
      }
    }

    if (passesExcept("exposed")) {
      counts.exposed.all = (counts.exposed.all || 0) + 1;
      const key = toy.is_exposed ? "true" : "false";
      counts.exposed[key] = (counts.exposed[key] || 0) + 1;
    }

    if (passesExcept("soon")) {
      counts.soon.all = (counts.soon.all || 0) + 1;
      const key = toy.is_soon ? "true" : "false";
      counts.soon[key] = (counts.soon[key] || 0) + 1;
    }

    if (passesExcept("year")) {
      const year = formatReleaseYear(toy.release_date);
      if (year) counts.releaseYears[year] = (counts.releaseYears[year] || 0) + 1;
    }

    if (passesExcept("occasion") && isGiftOccasion(toy.gift_occasion)) {
      counts.giftOccasions[toy.gift_occasion] =
        (counts.giftOccasions[toy.gift_occasion] || 0) + 1;
    }

    if (
      passesExcept("giftYear") &&
      isGiftOccasion(toy.gift_occasion) &&
      formatReleaseYear(toy.gift_year)
    ) {
      const year = formatReleaseYear(toy.gift_year)!;
      counts.giftYears[year] = (counts.giftYears[year] || 0) + 1;
    }
  }

  return counts;
}

function byFrenchName(values: Set<string>): string[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b, "fr"));
}

export function collectFilterOptions(toys: Toy[]) {
  const categories = new Set<string>();
  const subcategories = new Set<string>();
  const studios = new Set<string>();
  const locations = new Set<string>();
  const years = new Set<string>();
  const giftYears = new Set<string>();

  for (const toy of toys) {
    const names = toyNameSets(toy);
    names.categories.forEach((name) => categories.add(name));
    names.subcategories.forEach((name) => subcategories.add(name));
    names.studios.forEach((name) => studios.add(name));
    names.locations.forEach((name) => locations.add(name));
    const year = formatReleaseYear(toy.release_date);
    if (year) years.add(year);
    const giftYear = formatReleaseYear(toy.gift_year);
    if (isGiftOccasion(toy.gift_occasion) && giftYear) giftYears.add(giftYear);
  }

  return {
    categories: byFrenchName(categories),
    subcategories: byFrenchName(subcategories),
    studios: byFrenchName(studios),
    locations: byFrenchName(locations),
    releaseYears: Array.from(years).sort((a, b) => Number(b) - Number(a)),
    giftYears: Array.from(giftYears).sort((a, b) => Number(b) - Number(a)),
  };
}

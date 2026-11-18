import type { Filters } from "@/types/filters";
import { isGiftOccasion } from "@/lib/themeProfile";

export type SortCriteria =
  | "added_desc"
  | "added_asc"
  | "release_desc"
  | "release_asc";

export type ThemeViewState = {
  filters: Filters;
  page: number;
  sort: SortCriteria;
  perPage: number;
};

const SORTS = new Set<SortCriteria>([
  "added_desc",
  "added_asc",
  "release_desc",
  "release_asc",
]);

const PAGE_SIZES = new Set([12, 24, 48]);

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  subcategories: [],
  studios: [],
  locations: [],
  nbPiecesRange: "",
  isExposed: null,
  isSoon: null,
  releaseYear: "",
  giftOccasion: "",
  giftYear: "",
};

export const DEFAULT_THEME_VIEW: ThemeViewState = {
  filters: DEFAULT_FILTERS,
  page: 1,
  sort: "added_desc",
  perPage: 24,
};

type RawSearch =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

function readMany(raw: RawSearch, key: string): string[] {
  if (raw instanceof URLSearchParams) {
    return raw
      .getAll(key)
      .map((value) => value.trim())
      .filter(Boolean);
  }
  const value = raw[key];
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.map((item) => item.trim()).filter(Boolean);
}

function readOne(raw: RawSearch, key: string): string {
  const values = readMany(raw, key);
  return values[0] ?? "";
}

function readBool(value: string): boolean | null {
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

/** Relit page, tri et filtres depuis l'URL du thème. */
export function parseThemeView(raw: RawSearch): ThemeViewState {
  const pageValue = parseInt(readOne(raw, "page"), 10);
  const perValue = parseInt(readOne(raw, "per"), 10);
  const sortValue = readOne(raw, "sort") as SortCriteria;

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    perPage: PAGE_SIZES.has(perValue) ? perValue : 24,
    sort: SORTS.has(sortValue) ? sortValue : "added_desc",
    filters: {
      categories: readMany(raw, "cat"),
      subcategories: readMany(raw, "sub"),
      studios: readMany(raw, "stu"),
      locations: readMany(raw, "loc"),
      nbPiecesRange: readOne(raw, "pieces"),
      releaseYear: readOne(raw, "year"),
      giftOccasion: isGiftOccasion(readOne(raw, "occasion"))
        ? readOne(raw, "occasion")
        : "",
      giftYear: /^\d{4}$/.test(readOne(raw, "gyear")) ? readOne(raw, "gyear") : "",
      isExposed: readBool(readOne(raw, "exposed")),
      isSoon: readBool(readOne(raw, "soon")),
    },
  };
}

/** Reconstruit la query en conservant selectedToyId. Les valeurs par défaut sont omises. */
export function buildThemeViewSearch(
  state: ThemeViewState,
  current: URLSearchParams
): string {
  const params = new URLSearchParams();
  const selectedToyId = current.get("selectedToyId");
  if (selectedToyId) params.set("selectedToyId", selectedToyId);

  if (state.page > 1) params.set("page", String(state.page));
  if (state.sort !== "added_desc") params.set("sort", state.sort);
  if (state.perPage !== 24) params.set("per", String(state.perPage));

  for (const value of state.filters.categories) params.append("cat", value);
  for (const value of state.filters.subcategories) params.append("sub", value);
  for (const value of state.filters.studios) params.append("stu", value);
  for (const value of state.filters.locations) params.append("loc", value);

  if (state.filters.nbPiecesRange) params.set("pieces", state.filters.nbPiecesRange);
  if (state.filters.releaseYear) params.set("year", state.filters.releaseYear);
  if (state.filters.giftOccasion) params.set("occasion", state.filters.giftOccasion);
  if (state.filters.giftYear) params.set("gyear", state.filters.giftYear);
  if (state.filters.isExposed === true) params.set("exposed", "1");
  if (state.filters.isExposed === false) params.set("exposed", "0");
  if (state.filters.isSoon === true) params.set("soon", "1");
  if (state.filters.isSoon === false) params.set("soon", "0");

  return params.toString();
}

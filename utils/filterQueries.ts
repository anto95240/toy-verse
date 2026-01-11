import { SupabaseClient } from "@supabase/supabase-js";

interface Filters {
  categories: string[];
  studios: string[];
  nbPiecesRange: string;
  isExposed: boolean | null;
  isSoon: boolean | null;
  releaseYear: string;
}

interface FilterCounts {
  categories: Record<string, number>;
  studios: Record<string, number>;
  nbPiecesRanges: Record<string, number>;
  exposed: Record<string, number>;
  soon: Record<string, number>;
  releaseYears: Record<string, number>;
  totalToys?: number;
}

export function applyFiltersToQuery(query: any, filters: Filters) {
  if (filters.categories.length > 0) {
    query = query.in("categorie", filters.categories);
  }

  if (filters.studios.length > 0) {
    query = query.in("studio", filters.studios);
  }

  if (filters.nbPiecesRange) {
    const range = filters.nbPiecesRange;
    if (range === "0-200") {
      query = query.gte("nb_pieces", 0).lte("nb_pieces", 200);
    } else if (range === "201-500") {
      query = query.gte("nb_pieces", 201).lte("nb_pieces", 500);
    } else if (range === "501-1000") {
      query = query.gte("nb_pieces", 501).lte("nb_pieces", 1000);
    } else if (range === "1001-1500") {
      query = query.gte("nb_pieces", 1001).lte("nb_pieces", 1500);
    } else if (range === "1501-2000") {
      query = query.gte("nb_pieces", 1501).lte("nb_pieces", 2000);
    } else if (range === "2000+") {
      query = query.gte("nb_pieces", 2000);
    }
  }

  if (filters.isExposed !== null) {
    query = query.eq("is_exposed", filters.isExposed);
  }

  if (filters.isSoon !== null) {
    query = query.eq("is_soon", filters.isSoon);
  }

  if (filters.releaseYear && filters.releaseYear !== "") {
    const year = parseInt(filters.releaseYear, 10);
    if (!isNaN(year)) {
      query = query.eq("release_date", year);
    }
  }

  return query;
}

export async function fetchFilterCounts(
  supabase: SupabaseClient,
  themeId: string,
  categories: string[],
  studios: string[],
  filters: Filters
): Promise<FilterCounts> {
  const counts: FilterCounts = {
    categories: {},
    studios: {},
    nbPiecesRanges: {},
    exposed: {},
    soon: {},
    releaseYears: {},
    totalToys: 0,
  };

  try {
    const { count: totalCount } = await supabase
      .from("toys")
      .select("*", { count: "exact", head: true })
      .eq("theme_id", themeId);

    counts.totalToys = totalCount || 0;

    for (const category of categories) {
      let query = supabase
        .from("toys")
        .select("*", { count: "exact", head: true })
        .eq("theme_id", themeId)
        .eq("categorie", category);

      const tempFilters = { ...filters, categories: [] };
      query = applyFiltersToQuery(query, tempFilters);

      const { count } = await query;
      if (count !== null && count > 0) {
        counts.categories[category] = count;
      }
    }

    for (const studio of studios) {
      let query = supabase
        .from("toys")
        .select("*", { count: "exact", head: true })
        .eq("theme_id", themeId)
        .eq("studio", studio);

      const tempFilters = { ...filters, studios: [] };
      query = applyFiltersToQuery(query, tempFilters);

      const { count } = await query;
      if (count !== null && count > 0) {
        counts.studios[studio] = count;
      }
    }

    const pieceRanges = [
      { key: "0-200", min: 0, max: 200 },
      { key: "201-500", min: 201, max: 500 },
      { key: "501-1000", min: 501, max: 1000 },
      { key: "1001-1500", min: 1001, max: 1500 },
      { key: "1501-2000", min: 1501, max: 2000 },
      { key: "2000+", min: 2000, max: null },
    ];

    for (const range of pieceRanges) {
      let query = supabase
        .from("toys")
        .select("*", { count: "exact", head: true })
        .eq("theme_id", themeId)
        .gte("nb_pieces", range.min);

      if (range.max !== null) {
        query = query.lte("nb_pieces", range.max);
      }

      const tempFilters = { ...filters, nbPiecesRange: "" };
      query = applyFiltersToQuery(query, tempFilters);

      const { count } = await query;
      if (count !== null && count > 0) {
        counts.nbPiecesRanges[range.key] = count;
      }
    }

    const exposedOptions = [
      { key: "true", value: true },
      { key: "false", value: false },
      { key: "all", value: null },
    ];

    for (const option of exposedOptions) {
      let query = supabase
        .from("toys")
        .select("*", { count: "exact", head: true })
        .eq("theme_id", themeId);

      if (option.value !== null) {
        query = query.eq("is_exposed", option.value);
      }

      const tempFilters = { ...filters, isExposed: null };
      query = applyFiltersToQuery(query, tempFilters);

      const { count } = await query;
      if (count !== null) {
        counts.exposed[option.key] = count;
      }
    }

    const soonOptions = [
      { key: "true", value: true },
      { key: "false", value: false },
      { key: "all", value: null },
    ];

    for (const option of soonOptions) {
      let query = supabase
        .from("toys")
        .select("*", { count: "exact", head: true })
        .eq("theme_id", themeId);

      if (option.value !== null) {
        query = query.eq("is_soon", option.value);
      }

      const tempFilters = { ...filters, isSoon: null };
      query = applyFiltersToQuery(query, tempFilters);

      const { count } = await query;
      if (count !== null) {
        counts.soon[option.key] = count;
      }
    }

    const { data: yearsData } = await supabase
      .from("toys")
      .select("release_date")
      .eq("theme_id", themeId)
      .not("release_date", "is", null);

    if (yearsData) {
      const uniqueYears = [
        ...new Set(yearsData.map((item) => item.release_date)),
      ];

      for (const year of uniqueYears) {
        let query = supabase
          .from("toys")
          .select("*", { count: "exact", head: true })
          .eq("theme_id", themeId)
          .eq("release_date", year);

        const tempFilters = { ...filters, releaseYear: "" };
        query = applyFiltersToQuery(query, tempFilters);

        const { count } = await query;
        if (count !== null && count > 0) {
          counts.releaseYears[year.toString()] = count;
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors du calcul des compteurs:", error);
  }

  return counts;
}

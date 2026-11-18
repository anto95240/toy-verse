import { useState, useEffect, useMemo, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Toy } from "@/types/theme";
import type { Filters } from "@/types/filters";
import { toyMatchesFilters } from "@/utils/toyFacets";

/**
 * Hook for loading and filtering the toy list.
 * After loading, resolves the V2 referential IDs to names
 * so that ToyCard can display up-to-date V2 info (franchise, studio, etc.)
 */
export function useToyList(
  themeId: string,
  filters: Filters,
  sessionExists: boolean
) {
  const [allToys, setAllToys] = useState<Toy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const resolveV2Data = useCallback(async (toysToResolve: Toy[]) => {
    // Collect all IDs that need resolution
    const allCategoryIds = new Set<string>();
    const allStudioIds = new Set<string>();
    const allFranchiseIds = new Set<string>();
    const allLicenseIds = new Set<string>();
    const allCharacterIds = new Set<string>();
    const allLocationIds = new Set<string>();

    for (const toy of toysToResolve) {
      (toy.category_ids || []).filter(Boolean).forEach(id => allCategoryIds.add(id));
      (toy.studio_ids || []).filter(Boolean).forEach(id => allStudioIds.add(id));
      (toy.franchise_ids || []).filter(Boolean).forEach(id => allFranchiseIds.add(id));
      (toy.license_ids || []).filter(Boolean).forEach(id => allLicenseIds.add(id));
      (toy.character_ids || []).filter(Boolean).forEach(id => allCharacterIds.add(id));
      (toy.location_ids || []).filter(Boolean).forEach(id => allLocationIds.add(id));
    }

    const hasAny = allCategoryIds.size > 0 || allStudioIds.size > 0 ||
      allFranchiseIds.size > 0 || allLicenseIds.size > 0 ||
      allCharacterIds.size > 0 || allLocationIds.size > 0;

    if (!hasAny) return toysToResolve;

    try {
      const res = await fetch("/api/referential/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_ids: Array.from(allCategoryIds),
          studio_ids: Array.from(allStudioIds),
          franchise_ids: Array.from(allFranchiseIds),
          license_ids: Array.from(allLicenseIds),
          character_ids: Array.from(allCharacterIds),
          location_ids: Array.from(allLocationIds),
        }),
      });

      if (!res.ok) return toysToResolve;
      const resolved = await res.json();

      // Build lookup maps
      const catMap = new Map((resolved.categories || []).map((e: any) => [e.id, e]));
      const stuMap = new Map((resolved.studios || []).map((e: any) => [e.id, e]));
      const fraMap = new Map((resolved.franchises || []).map((e: any) => [e.id, e]));
      const licMap = new Map((resolved.licenses || []).map((e: any) => [e.id, e]));
      const charMap = new Map((resolved.characters || []).map((e: any) => [e.id, e]));
      const locMap = new Map((resolved.locations || []).map((e: any) => [e.id, e]));

      // Enrich each toy with v2_data
      return toysToResolve.map(toy => {
        const categoryIds = (toy.category_ids || []).filter(Boolean);
        const studioIds = (toy.studio_ids || []).filter(Boolean);
        const franchiseIds = (toy.franchise_ids || []).filter(Boolean);
        const licenseIds = (toy.license_ids || []).filter(Boolean);
        const characterIds = (toy.character_ids || []).filter(Boolean);
        const locationIds = (toy.location_ids || []).filter(Boolean);

        const isMigrated = categoryIds.length > 0;
        if (!isMigrated) return toy;

        return {
          ...toy,
          v2_data: {
            category_ids: categoryIds.map(id => catMap.get(id)).filter(Boolean),
            studio_ids: studioIds.map(id => stuMap.get(id)).filter(Boolean),
            franchise_ids: franchiseIds.map(id => fraMap.get(id)).filter(Boolean),
            license_ids: licenseIds.map(id => licMap.get(id)).filter(Boolean),
            character_ids: characterIds.map(id => charMap.get(id)).filter(Boolean),
            location_ids: locationIds.map(id => locMap.get(id)).filter(Boolean),
          },
        } as any;
      });
    } catch (err) {
      console.warn("[useToyList] Impossible de résoudre les IDs V2:", err);
      return toysToResolve;
    }
  }, []);

  useEffect(() => {
    if (!sessionExists) return;

    let cancelled = false;

    const loadToys = async (silent: boolean) => {
      if (!silent) setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("toys")
          .select("*")
          .eq("theme_id", themeId);

        if (cancelled) return;

        if (error) {
          console.error("❌ Erreur lors du chargement des toys:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          return;
        }

        const sorted = (data || []).sort((a: Toy, b: Toy) => {
          if (!a.numero) return 1;
          if (!b.numero) return -1;
          const numA = parseInt(a.numero.toString(), 10);
          const numB = parseInt(b.numero.toString(), 10);
          return isNaN(numA) || isNaN(numB)
            ? a.numero.localeCompare(b.numero)
            : numA - numB;
        });

        const enriched = await resolveV2Data(sorted);
        if (!cancelled) setAllToys(enriched);
      } catch (err) {
        console.error("💥 Erreur inattendue lors du chargement des toys:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadToys(false);

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const sub = supabase
      .channel(`toys-list-${themeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "toys",
          filter: `theme_id=eq.${themeId}`,
        },
        () => {
          if (cancelled) return;
          if (refreshTimer) clearTimeout(refreshTimer);
          refreshTimer = setTimeout(() => {
            if (!cancelled) loadToys(true);
          }, 400);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      sub.unsubscribe();
    };
  }, [sessionExists, themeId, supabase, resolveV2Data]);

  const toys = useMemo(
    () => allToys.filter((toy) => toyMatchesFilters(toy, filters)),
    [allToys, filters]
  );

  return {
    toys,
    allToys,
    setToys: setAllToys,
    isLoading,
  };
}

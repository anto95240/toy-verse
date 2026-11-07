import { useState, useEffect, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Charge les options de filtres à partir du legacy ET des IDs V2 résolus.
 * Affiche catégories parentes + sous-catégories distinctes, studios propres, lieux.
 */
export function useFilterOptions(themeId: string, sessionExists: boolean) {
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [studios, setStudios] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [releaseYears, setReleaseYears] = useState<string[]>([]);

  const supabase = useMemo(() => getSupabaseClient(), []);

  useEffect(() => {
    if (!sessionExists) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("toys")
        .select(
          "categorie, studio, release_date, category_ids, studio_ids, location_ids"
        )
        .eq("theme_id", themeId);

      if (error || !data) return;

      const allCategoryIds = new Set<string>();
      const allStudioIds = new Set<string>();
      const allLocationIds = new Set<string>();
      const legacyCats = new Set<string>();
      const legacyStudios = new Set<string>();
      const years = new Set<string>();

      for (const toy of data as any[]) {
        if (toy.categorie) legacyCats.add(toy.categorie);
        if (toy.studio) {
          // Le legacy studio peut être "A / B / C" — on garde tel quel en fallback
          legacyStudios.add(toy.studio);
        }
        if (toy.release_date != null) years.add(String(toy.release_date));
        (toy.category_ids || []).filter(Boolean).forEach((id: string) => allCategoryIds.add(id));
        (toy.studio_ids || []).filter(Boolean).forEach((id: string) => allStudioIds.add(id));
        (toy.location_ids || []).filter(Boolean).forEach((id: string) => allLocationIds.add(id));
      }

      let catMap = new Map<string, { id: string; name: string; parent_id?: string | null; level?: number }>();
      let stuMap = new Map<string, { id: string; name: string }>();
      let locMap = new Map<string, { id: string; name: string }>();

      if (allCategoryIds.size || allStudioIds.size || allLocationIds.size) {
        try {
          const res = await fetch("/api/referential/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category_ids: Array.from(allCategoryIds),
              studio_ids: Array.from(allStudioIds),
              location_ids: Array.from(allLocationIds),
            }),
          });
          if (res.ok) {
            const resolved = await res.json();
            catMap = new Map((resolved.categories || []).map((e: any) => [e.id, e]));
            stuMap = new Map((resolved.studios || []).map((e: any) => [e.id, e]));
            locMap = new Map((resolved.locations || []).map((e: any) => [e.id, e]));
          }
        } catch {
          // fallback legacy only
        }
      }

      const parentCats = new Set<string>();
      const childCats = new Set<string>();
      const v2Studios = new Set<string>();
      const v2Locations = new Set<string>();

      for (const toy of data as any[]) {
        const catIds: string[] = (toy.category_ids || []).filter(Boolean);
        if (catIds.length > 0) {
          const parent = catMap.get(catIds[0]);
          if (parent?.name) parentCats.add(parent.name);
          if (catIds[1]) {
            const child = catMap.get(catIds[1]);
            if (child?.name) childCats.add(child.name);
          }
          // Aussi classer par level si disponible
          for (const id of catIds) {
            const c = catMap.get(id);
            if (!c?.name) continue;
            if (c.level === 1 || c.parent_id) childCats.add(c.name);
            else parentCats.add(c.name);
          }
        } else if (toy.categorie) {
          parentCats.add(toy.categorie);
        }

        const stuIds: string[] = (toy.studio_ids || []).filter(Boolean);
        if (stuIds.length > 0) {
          for (const id of stuIds) {
            const s = stuMap.get(id);
            if (s?.name) v2Studios.add(s.name);
          }
        } else if (toy.studio) {
          legacyStudios.add(toy.studio);
        }

        for (const id of toy.location_ids || []) {
          const l = locMap.get(id);
          if (l?.name) v2Locations.add(l.name);
        }
      }

      const finalCats =
        parentCats.size > 0
          ? Array.from(parentCats).sort((a, b) => a.localeCompare(b, "fr"))
          : Array.from(legacyCats).sort((a, b) => a.localeCompare(b, "fr"));

      const finalStudios =
        v2Studios.size > 0
          ? Array.from(v2Studios).sort((a, b) => a.localeCompare(b, "fr"))
          : Array.from(legacyStudios).sort((a, b) => a.localeCompare(b, "fr"));

      setCategories(finalCats);
      setSubcategories(Array.from(childCats).sort((a, b) => a.localeCompare(b, "fr")));
      setStudios(finalStudios);
      setLocations(Array.from(v2Locations).sort((a, b) => a.localeCompare(b, "fr")));
      setReleaseYears(
        Array.from(years).sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
      );
    };

    load();

    const sub = supabase
      .channel(`toys-filter-options-${themeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "toys",
          filter: `theme_id=eq.${themeId}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [sessionExists, themeId, supabase]);

  return {
    categories,
    subcategories,
    studios,
    locations,
    releaseYears,
  };
}

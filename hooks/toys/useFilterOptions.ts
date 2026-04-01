import { useState, useEffect, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * Hook for loading and maintaining filter options (categories, studios, release years)
 * Handles Supabase subscriptions for real-time updates
 */
export function useFilterOptions(themeId: string, sessionExists: boolean) {
  const [categories, setCategories] = useState<string[]>([]);
  const [studios, setStudios] = useState<string[]>([]);
  const [releaseYears, setReleaseYears] = useState<string[]>([]);

  const supabase = useMemo(() => getSupabaseClient(), []);

  // Load categories with real-time subscription
  useEffect(() => {
    if (!sessionExists) return;

    const loadCategories = async () => {
      const { data, error } = await (supabase
        .from("toys")
        .select("categorie") as any)
        .eq("theme_id", themeId)
        .not("categorie", "is", null)
        .order("categorie", { ascending: true });

      if (!error) {
        const unique = Array.from(
          new Set(data?.map((c: any) => c.categorie).filter(Boolean) || [])
        ) as string[];
        setCategories(unique);
      }
    };

    loadCategories();

    const sub = supabase
      .channel(`toys-categories-${themeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "toys",
          filter: `theme_id=eq.${themeId}`,
        },
        () => loadCategories()
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [sessionExists, themeId, supabase]);

  // Load studios with real-time subscription
  useEffect(() => {
    if (!sessionExists) return;

    const loadStudios = async () => {
      const { data, error } = await (supabase
        .from("toys")
        .select("studio") as any)
        .eq("theme_id", themeId)
        .not("studio", "is", null)
        .order("studio", { ascending: true });

      if (!error) {
        const unique = Array.from(
          new Set(data?.map((s: any) => s.studio).filter(Boolean) || [])
        ) as string[];
        setStudios(unique);
      }
    };

    loadStudios();

    const sub = supabase
      .channel(`toys-studios-${themeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "toys",
          filter: `theme_id=eq.${themeId}`,
        },
        () => loadStudios()
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [sessionExists, themeId, supabase]);

  // Load release years with real-time subscription
  useEffect(() => {
    if (!sessionExists) return;

    const loadYears = async () => {
      const { data, error } = await (supabase
        .from("toys")
        .select("release_date") as any)
        .eq("theme_id", themeId)
        .not("release_date", "is", null)
        .order("release_date", { ascending: false });

      if (!error) {
        const unique = Array.from(
          new Set(
            (data || [])
              .map((r: any) => r.release_date?.toString())
              .filter(Boolean)
          )
        ) as string[];
        setReleaseYears(unique);
      }
    };

    loadYears();

    const sub = supabase
      .channel(`toys-years-${themeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "toys",
          filter: `theme_id=eq.${themeId}`,
        },
        () => loadYears()
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [sessionExists, themeId, supabase]);

  return {
    categories,
    studios,
    releaseYears,
  };
}

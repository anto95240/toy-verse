import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { signStoragePaths } from "@/utils/imageUtils";
import type { Theme } from "@/types/theme";

function themeStoragePath(imageUrl: string) {
  if (imageUrl.startsWith("http") || imageUrl.startsWith("themes/")) return imageUrl;
  return `themes/${imageUrl}`;
}

export function useThemeList(initialThemes: Theme[]) {
  const [themes, setThemes] = useState<Theme[]>(initialThemes);
  const [imageUrls, setImageUrls] = useState<Record<string, string | null>>({});

  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [deletingTheme, setDeletingTheme] = useState<Theme | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = getSupabaseClient();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      const withImage = themes.filter((theme) => theme.image_url);
      const paths = withImage.map((theme) => themeStoragePath(theme.image_url!));
      const signed = await signStoragePaths(paths);
      if (cancelled) return;
      const urls: Record<string, string | null> = {};
      withImage.forEach((theme, index) => {
        urls[theme.id] = signed.get(paths[index]) ?? null;
      });
      setImageUrls(urls);
    }

    if (themes.length > 0) loadImages();
    return () => {
      cancelled = true;
    };
  }, [themes]);

  const addTheme = useCallback(
    (t: Theme) => {
      setThemes((p) => [t, ...p]);
      showToast(`Thème "${t.name}" créé`, "success");
    },
    [showToast]
  );

  const updateTheme = useCallback(
    (t: Theme) => {
      setThemes((p) => p.map((old) => (old.id === t.id ? t : old)));
      showToast(`Thème "${t.name}" mis à jour`, "success");
    },
    [showToast]
  );

  const openEdit = useCallback((t?: Theme) => {
    setEditingTheme(t || null);
    setIsEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    setIsEditOpen(false);
    setEditingTheme(null);
  }, []);

  const openDelete = useCallback((t: Theme) => {
    setDeletingTheme(t);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingTheme) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("themes")
      .delete()
      .eq("id", deletingTheme.id);
    if (!error) {
      setThemes((p) => p.filter((t) => t.id !== deletingTheme.id));
      showToast("Thème supprimé", "success");
    } else {
      showToast("Erreur suppression", "error");
    }
    setIsDeleting(false);
    setDeletingTheme(null);
  }, [deletingTheme, supabase, showToast]);

  return {
    themes,
    imageUrls,
    editingTheme,
    isEditOpen,
    openEdit,
    closeEdit,
    deletingTheme,
    setDeletingTheme,
    isDeleting,
    confirmDelete,
    addTheme,
    updateTheme,
  };
}
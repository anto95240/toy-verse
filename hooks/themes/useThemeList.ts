import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import type { Theme } from "@/types/theme";

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
    async function loadImages() {
      const urls: Record<string, string | null> = {};
      for (const t of themes) {
        if (t.image_url) {
          const path = t.image_url.startsWith("http")
            ? t.image_url
            : t.image_url.startsWith("themes/")
            ? t.image_url
            : `themes/${t.image_url}`;
          if (path.startsWith("http")) urls[t.id] = path;
          else {
            const { data } = await supabase.storage
              .from("toys-images")
              .createSignedUrl(path, 3600);
            urls[t.id] = data?.signedUrl || null;
          }
        }
      }
      setImageUrls(urls);
    }
    if (themes.length > 0) loadImages();
  }, [themes, supabase]);

  const addTheme = (t: Theme) => {
    setThemes((p) => [t, ...p]);
    showToast(`Thème "${t.name}" créé`, "success");
  };

  const updateTheme = (t: Theme) => {
    setThemes((p) => p.map((old) => (old.id === t.id ? t : old)));
    showToast(`Thème "${t.name}" mis à jour`, "success");
  };

  const openEdit = (t?: Theme) => {
    setEditingTheme(t || null);
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingTheme(null);
  };

  const confirmDelete = async () => {
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
  };

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

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { createSlug } from "@/utils/slugUtils";
import { useThemeList } from "@/hooks/themes/useThemeList";
import { ThemeCard } from "@/components/theme/ThemeCard";
import Modal from "@/components/ui/Modal";
import ThemeForm from "@/components/theme/ThemeForm";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useFab } from "@/context/FabContext"; // <--- Import du contexte
import type { Theme } from "@/types/theme";

interface ThemesListProps {
  initialThemes: Theme[];
  userId: string;
  onThemeClick?: (theme: Theme) => void;
}

export default function ThemesList({
  initialThemes,
  userId,
  onThemeClick,
}: ThemesListProps) {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { showToast } = useToast();
  // On récupère la fonction pour enregistrer l'action du bouton "+"
  const { registerAction } = useFab(); 

  const [loading, setLoading] = React.useState(false);

  const {
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
  } = useThemeList(initialThemes);

  // EFFET CLÉ : On connecte le bouton "+" du BottomNav à la fonction openEdit de ce composant
  useEffect(() => {
    registerAction(() => openEdit());
  }, [registerAction, openEdit]);

  const handleFormSubmit = async (name: string, file: File | null) => {
    setLoading(true);
    try {
      let imagePath = editingTheme?.image_url || null;
      if (file) {
        const { convertToWebP, generateImagePath } = await import(
          "@/utils/imageConverter"
        );
        const webpFile = await convertToWebP(file);
        const fileName = generateImagePath(userId, "themes");
        const { error: uploadError } = await supabase.storage
          .from("toys-images")
          .upload(fileName, webpFile);
        if (uploadError) throw uploadError;
        imagePath = fileName;
      }

      const query = supabase.from("themes");

      const q = editingTheme
        ? query
            .update({ name, image_url: imagePath } as unknown as never)
            .eq("id", editingTheme.id)
        : query.insert({
            name,
            image_url: imagePath,
            user_id: userId,
          } as unknown as never);

      const { data, error } = await q.select().single();

      if (error) throw error;

      if (editingTheme) {
        updateTheme(data);
      } else {
        addTheme(data);
      }
      closeEdit();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (t: Theme) =>
    onThemeClick ? onThemeClick(t) : router.push(`/${createSlug(t.name)}`);

  return (
    <>
      {themes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun thème ajouté</p>
          <button
            onClick={() => openEdit()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Créer votre premier thème
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center pb-20 md:pb-0">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              imageUrl={imageUrls[theme.id] || null}
              onClick={() => handleClick(theme)}
              onEdit={(e) => {
                e.stopPropagation();
                openEdit(theme);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                setDeletingTheme(theme);
              }}
            />
          ))}
        </ul>
      )}

      {/* Ce bouton est caché sur mobile (hidden) et visible sur desktop (md:block).
        Sur mobile, c'est le BottomNav qui prend le relais via le FabContext.
      */}
      <div className="hidden md:block fixed bottom-24 right-6 sm:bottom-6 z-40">
        <button
          onClick={() => openEdit()}
          className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg hover:bg-primary/90 flex items-center justify-center hover:scale-105 transition-all"
          aria-label="Ajouter"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xl" />
        </button>
      </div>

      <Modal
        isOpen={isEditOpen}
        onClose={closeEdit}
        title={editingTheme ? "Modifier le thème" : "Nouveau thème"}
        loading={loading}
      >
        <ThemeForm
          initialName={editingTheme?.name || ""}
          initialImageUrl={editingTheme?.image_url || null}
          onSubmit={handleFormSubmit}
          onCancel={closeEdit}
          loading={loading}
          isEditing={!!editingTheme}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!deletingTheme}
        onClose={() => setDeletingTheme(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Supprimer ce thème ?"
        message={`Voulez-vous vraiment supprimer "${deletingTheme?.name}" et tous ses jouets ?`}
      />
    </>
  );
}
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import type { Toy } from "@/types/theme";
import type { ToyFormValues } from "@/components/toys/ToyForm";
import { createEmptyToyFormValues, serializeToyFormValues } from "@/components/toys/ToyForm";

export function useToyModal(
  isOpen: boolean,
  onClose: () => void,
  themeId: string,
  userId: string,
  onSave: (toy: Toy) => void,
  toy: Toy | null
) {
  const supabase = getSupabaseClient();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState<ToyFormValues>(
    createEmptyToyFormValues(themeId, userId)
  );

  useEffect(() => {
    if (!isOpen) return;
    if (toy) {
      // Mode édition : initialiser le formulaire avec les données existantes
      const { id, created_at, ...toyData } = toy;
      void id; void created_at;
      setForm({
        ...createEmptyToyFormValues(themeId, userId),
        ...toyData,
        theme_id: themeId,
        user_id: userId,
      });
      setFile(null);
      if (toy.photo_url) {
        if (toy.photo_url.startsWith("http")) setPreviewUrl(toy.photo_url);
        else {
          supabase.storage
            .from("toys-images")
            .createSignedUrl(toy.photo_url, 3600)
            .then(({ data }) => setPreviewUrl(data?.signedUrl || null));
        }
      } else setPreviewUrl(null);
    } else {
      setForm(createEmptyToyFormValues(themeId, userId));
      setFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, toy, themeId, userId, supabase]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return showToast("Nom requis", "error");
    if (form.nb_pieces !== null && form.nb_pieces < 0)
      return showToast("Pièces invalides", "error");

    // Sérialiser les valeurs V2 vers les champs BDD (maintient la rétrocompatibilité)
    const serialized = serializeToyFormValues(form);

    if (toy && !file) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("toys")
          .update(serialized as unknown as never)
          .eq("id", toy.id);

        if (error) {
          console.error("❌ Erreur UPDATE:", error);
          throw error;
        }

        onSave({ ...toy, ...serialized, id: toy.id, created_at: toy.created_at });
        onClose();
        showToast(`${form.nom} modifié`, "success");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour";
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      let photoUrl = form.photo_url;
      if (file) {
        const path = `toys/${userId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("toys-images")
          .upload(path, file, { upsert: true });
        if (error) throw error;
        photoUrl = path;
      }

      const query = supabase.from("toys");

      if (toy) {
        const { error: updateError } = await query
          .update({ ...serialized, photo_url: photoUrl } as unknown as never)
          .eq("id", toy.id);

        if (updateError) {
          console.error("❌ Erreur Supabase update avec fichier:", updateError);
          throw updateError;
        }

        onSave({
          ...toy,
          ...serialized,
          photo_url: photoUrl,
          id: toy.id,
          created_at: toy.created_at,
        });
      } else {
        const { data, error } = await query
          .insert([{ ...serialized, photo_url: photoUrl }] as unknown as never)
          .select()
          .single();

        if (error) {
          console.error("❌ Erreur Supabase insert:", error);
          throw error;
        }

        onSave(data);
      }

      showToast(toy ? `${form.nom} modifié` : `${form.nom} créé`, "success");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    file,
    setFile,
    previewUrl,
    setPreviewUrl,
    loading,
    showImagePopup,
    setShowImagePopup,
    handleSubmit,
  };
}

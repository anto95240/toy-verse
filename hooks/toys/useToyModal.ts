import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import type { Toy } from "@/types/theme";

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

  const [form, setForm] = useState<Omit<Toy, "id" | "created_at">>({
    theme_id: themeId,
    user_id: userId,
    nom: "",
    taille: "",
    nb_pieces: null,
    numero: "",
    is_exposed: false,
    is_soon: false,
    photo_url: null,
    categorie: "",
    studio: "",
    release_date: null,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (toy) {
      setForm({ ...toy, theme_id: themeId, user_id: userId });
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
      setForm({
        theme_id: themeId,
        user_id: userId,
        nom: "",
        taille: "",
        nb_pieces: null,
        numero: "",
        is_exposed: false,
        is_soon: false,
        photo_url: null,
        categorie: "",
        studio: "",
        release_date: null,
      });
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

    if (toy && !file) {
      onSave({ ...toy, ...form, id: toy.id, created_at: toy.created_at });
      onClose();
      showToast("Modifié (Optimiste)", "success");

      const { error } = await supabase
        .from("toys")
        .update(form as unknown as never)
        .eq("id", toy.id);
      if (error) showToast("Erreur sauvegarde background", "error");
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

      const q = toy
        ? query
            .update({ ...form, photo_url: photoUrl } as unknown as never)
            .eq("id", toy.id)
        : query.insert([{ ...form, photo_url: photoUrl }] as unknown as never);

      const { data, error } = await q.select().single();

      if (error) throw error;
      onSave(data);
      showToast(toy ? "Jouet modifié" : "Jouet créé", "success");
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

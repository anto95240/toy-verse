import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import type { Toy } from "@/types/theme";

// Type pour les champs éditables UNIQUEMENT (pas id, created_at, theme_id, user_id)
type EditableToyFields = Omit<Toy, "id" | "created_at" | "theme_id" | "user_id">;

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
    taille: null,
    nb_pieces: null,
    numero: null,
    is_exposed: false,
    is_soon: false,
    photo_url: null,
    categorie: null,
    studio: "",
    release_date: null,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (toy) {
      const { id, created_at, ...toyData } = toy;
      setForm({ ...toyData, theme_id: themeId, user_id: userId });
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
        taille: null,
        nb_pieces: null,
        numero: null,
        is_exposed: false,
        is_soon: false,
        photo_url: null,
        categorie: null,
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

  // Construire le payload en incluant UNIQUEMENT les champs éditables
  const getUpdatePayload = (data: Omit<Toy, "id" | "created_at">): EditableToyFields => {
    const payload: EditableToyFields = {
      nom: data.nom,
      taille: data.taille,
      nb_pieces: data.nb_pieces,
      numero: data.numero,
      is_exposed: data.is_exposed,
      is_soon: data.is_soon,
      photo_url: data.photo_url,
      categorie: data.categorie,
      studio: data.studio,
      release_date: data.release_date,
    };
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return showToast("Nom requis", "error");
    if (form.nb_pieces !== null && form.nb_pieces < 0)
      return showToast("Pièces invalides", "error");

    if (toy && !file) {
      setLoading(true);
      try {
        const updateData = getUpdatePayload(form);
        
        if (Object.keys(updateData).length === 0) {
          console.error("❌ Payload d'update EST VIDE!");
          throw new Error("Payload d'update vide");
        }
        
        // Copier le pattern de DELETE qui fonctionne
        const { error } = await supabase
          .from("toys")
          .update(updateData as unknown as never)
          .eq("id", toy.id);  // ✅ Juste l'ID comme DELETE
        
        if (error) {
          console.error("❌ Erreur UPDATE:", error);
          throw error;
        }
        
        onSave({ ...toy, ...form, id: toy.id, created_at: toy.created_at });
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
        // UPDATE avec fichier - ne pas utiliser .select().single() (bug RLS)
        console.log("🔄 Update avec fichier pour toy ID:", toy.id);
        const updateData = getUpdatePayload(form);
        console.log("Envoi avec photo_url:", photoUrl);
        const { error: updateError } = await query
          .update({ ...updateData, photo_url: photoUrl } as unknown as never)
          .eq("id", toy.id);  // ✅ Juste l'ID comme DELETE
        
        if (updateError) {
          console.error("❌ Erreur Supabase update avec fichier:", updateError);
          throw updateError;
        }
        
        // Construire l'objet retourné sans faire SELECT
        onSave({ 
          ...toy, 
          ...updateData, 
          photo_url: photoUrl,
          id: toy.id, 
          created_at: toy.created_at 
        });
      } else {
        // INSERT - utiliser .select().single() normalement
        const { data, error } = await query
          .insert([{ ...form, photo_url: photoUrl }] as unknown as never)
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

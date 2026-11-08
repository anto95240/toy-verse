import { useState, useEffect, useRef, useCallback } from "react";
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

  const [form, setFormState] = useState<ToyFormValues>(
    createEmptyToyFormValues(themeId, userId)
  );
  const formRef = useRef(form);
  const setForm = useCallback((action: React.SetStateAction<ToyFormValues>) => {
    setFormState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      formRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (toy) {
      // Mode édition : initialiser le formulaire avec les données existantes
      const { id, created_at, ...toyData } = toy;
      void id; void created_at;

      const baseForm: ToyFormValues = {
        ...createEmptyToyFormValues(themeId, userId),
        ...toyData,
        theme_id: themeId,
        user_id: userId,
        // Réinitialiser les champs V2 — ils seront remplis après la résolution
        _v2_category:    null,
        _v2_subcategory: null,
        _v2_studio:      null,
        _v2_license:     null,
        _v2_franchise:   null,
        _v2_characters:  [],
        _v2_location:    null,
      };
      setForm(baseForm);

      // Résoudre les IDs V2 en SmartSelectItems
      const hasV2Ids =
        (toy.category_ids  ?? []).filter(Boolean).length > 0 ||
        (toy.studio_ids    ?? []).filter(Boolean).length > 0 ||
        (toy.license_ids   ?? []).filter(Boolean).length > 0 ||
        (toy.franchise_ids ?? []).filter(Boolean).length > 0 ||
        (toy.character_ids ?? []).filter(Boolean).length > 0 ||
        (toy.location_ids  ?? []).filter(Boolean).length > 0;

      if (hasV2Ids) {
        fetch("/api/referential/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category_ids:  (toy.category_ids  ?? []).filter(Boolean),
            studio_ids:    (toy.studio_ids    ?? []).filter(Boolean),
            license_ids:   (toy.license_ids   ?? []).filter(Boolean),
            franchise_ids: (toy.franchise_ids ?? []).filter(Boolean),
            character_ids: (toy.character_ids ?? []).filter(Boolean),
            location_ids:  (toy.location_ids  ?? []).filter(Boolean),
          }),
        })
          .then((r) => r.json())
          .then((resolved) => {
            setForm((prev) => ({
              ...prev,
              _v2_category:    resolved.categories?.[0]  ? { id: resolved.categories[0].id,  name: resolved.categories[0].name,  slug: resolved.categories[0].slug  } : null,
              _v2_subcategory: resolved.categories?.[1]  ? { id: resolved.categories[1].id,  name: resolved.categories[1].name,  slug: resolved.categories[1].slug  } : null,
              _v2_studio:      resolved.studios?.[0]     ? { id: resolved.studios[0].id,      name: resolved.studios[0].name,      slug: resolved.studios[0].slug      } : null,
              _v2_license:     resolved.licenses?.[0]    ? { id: resolved.licenses[0].id,     name: resolved.licenses[0].name,     slug: resolved.licenses[0].slug     } : null,
              _v2_franchise:   resolved.franchises?.[0]  ? { id: resolved.franchises[0].id,   name: resolved.franchises[0].name,   slug: resolved.franchises[0].slug   } : null,
              _v2_characters:  (resolved.characters ?? []).map((c: { id: string; name: string; slug: string }) => ({ id: c.id, name: c.name, slug: c.slug })),
              _v2_location:    resolved.locations?.[0]   ? { id: resolved.locations[0].id,    name: resolved.locations[0].name,    slug: resolved.locations[0].slug    } : null,
            }));
          })
          .catch((err) => console.warn("[useToyModal] Impossible de résoudre les IDs V2:", err));
      }

      setFile(null);
      if (toy.photo_url) {
        if (toy.photo_url.startsWith("http")) setPreviewUrl(toy.photo_url);
        else {
          supabase.storage
            .from("toys-images")
            .createSignedUrl(toy.photo_url, 3600)
            .then(({ data }: { data: { signedUrl: string } | null }) => setPreviewUrl(data?.signedUrl || null));
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
    const current = formRef.current;
    if (!current.nom.trim()) return showToast("Nom requis", "error");
    if (current.nb_pieces !== null && current.nb_pieces < 0)
      return showToast("Pièces invalides", "error");

    // Sérialiser les valeurs V2 vers les champs BDD (maintient la rétrocompatibilité)
    const serialized = serializeToyFormValues(current);

    // Construire v2_data pour l'affichage en direct dans le modal de détails sans recharger la page
    const v2_data = {
      category_ids: [
        ...(current._v2_category ? [{ id: current._v2_category.id, name: current._v2_category.name }] : []),
        ...(current._v2_subcategory ? [{ id: current._v2_subcategory.id, name: current._v2_subcategory.name }] : []),
      ],
      studio_ids: current._v2_studio ? [{ id: current._v2_studio.id, name: current._v2_studio.name }] : [],
      license_ids: current._v2_license ? [{ id: current._v2_license.id, name: current._v2_license.name }] : [],
      franchise_ids: current._v2_franchise ? [{ id: current._v2_franchise.id, name: current._v2_franchise.name }] : [],
      character_ids: current._v2_characters.map((c) => ({ id: c.id, name: c.name })),
      location_ids: current._v2_location ? [{ id: current._v2_location.id, name: current._v2_location.name }] : [],
    };

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

        onSave({ ...toy, ...serialized, v2_data, id: toy.id, created_at: toy.created_at });
        onClose();
        showToast(`${current.nom} modifié`, "success");
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
      let photoUrl = current.photo_url;
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
          v2_data,
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

        onSave({ ...data, v2_data });
      }

      showToast(toy ? `${current.nom} modifié` : `${current.nom} créé`, "success");
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

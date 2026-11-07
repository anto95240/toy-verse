import { useState, useEffect, useRef } from "react";
import type { Suggestion } from "@/components/ui/SuggestionBanner";
import type { SmartSelectItem } from "@/components/ui/SmartSelect";
import type { FieldKey, ThemeProfile } from "@/lib/themeProfile";
import { isFieldHidden, getFieldLabel, getFieldPlaceholder } from "@/lib/themeProfile";
import type { ToyFormValues } from "@/components/toys/ToyForm";
import type { ReferentialEntityKey } from "@/types/theme";

/** Champs référentiel déjà renseignés → pas besoin d'appeler l'IA pour les redire. */
function countFilledReferentials(form: ToyFormValues): number {
  let n = 0;
  if (form._v2_category) n++;
  if (form._v2_subcategory) n++;
  if (form._v2_studio) n++;
  if (form._v2_franchise) n++;
  if (form._v2_license) n++;
  if (form._v2_location) n++;
  if (form._v2_characters.length > 0) n++;
  if (form.numero) n++;
  if (form.nb_pieces != null) n++;
  return n;
}

function shouldSkipAI(form: ToyFormValues, isEditMode: boolean): boolean {
  if (!form.nom || form.nom.trim().length < 5) return true;
  // En édition : si le référentiel principal est déjà rempli, inutile de rappeler l'IA
  if (isEditMode && form._v2_category && countFilledReferentials(form) >= 3) {
    return true;
  }
  return false;
}

export function useToyForm(
  form: ToyFormValues,
  setForm: React.Dispatch<React.SetStateAction<ToyFormValues>>,
  profile: ThemeProfile,
  isEditMode = false
) {
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());
  const [skippedFields, setSkippedFields] = useState<Set<FieldKey>>(new Set());
  const [photoLater, setPhotoLater] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const lastAINameRef = useRef<string>("");

  const hasV2Data =
    form._v2_subcategory ||
    form._v2_studio ||
    form._v2_license ||
    form._v2_franchise ||
    form._v2_characters.length > 0 ||
    form._v2_location;

  useEffect(() => {
    if (hasV2Data || profile.autoOpenDetails) setShowDetails(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggestions croisées (référentiel, pas Gemini)
  useEffect(() => {
    const sources: { entity: ReferentialEntityKey; id: string }[] = [];

    if (form._v2_characters.length > 0) {
      const lastChar = form._v2_characters[form._v2_characters.length - 1];
      if (!lastChar.id.startsWith("new:")) {
        sources.push({ entity: "character", id: lastChar.id });
      }
    }

    if (form._v2_franchise && !form._v2_franchise.id.startsWith("new:")) {
      sources.push({ entity: "franchise", id: form._v2_franchise.id });
    }

    if (sources.length === 0) return;

    const source = sources[0];
    const controller = new AbortController();

    fetch("/api/referential/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromEntity: source.entity, fromId: source.id }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        const newSuggestions: Suggestion[] = (json.suggestions ?? [])
          .filter((s: Suggestion) => !rejectedSuggestions.has(`${s.entityType}-${s.item.id}`))
          .filter((s: Suggestion) => {
            if (s.entityType === "franchise" && form._v2_franchise?.id === s.item.id) return false;
            if (s.entityType === "studio" && form._v2_studio?.id === s.item.id) return false;
            if (s.entityType === "license" && form._v2_license?.id === s.item.id) return false;
            return true;
          });
        if (newSuggestions.length > 0) {
          setSuggestions((prev) => {
            const merged = [...prev];
            for (const s of newSuggestions) {
              if (!merged.some((e) => e.entityType === s.entityType && e.item.id === s.item.id)) {
                merged.push(s);
              }
            }
            return merged;
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [form._v2_characters, form._v2_franchise]); // eslint-disable-line react-hooks/exhaustive-deps

  // IA Gemini — uniquement si des champs manquent vraiment
  useEffect(() => {
    if (shouldSkipAI(form, isEditMode)) return;

    const normalizedName = form.nom.trim().toLowerCase();
    // Évite de re-appeler l'IA pour le même nom si on a déjà des données
    if (normalizedName === lastAINameRef.current && countFilledReferentials(form) > 0) {
      return;
    }

    const handler = setTimeout(async () => {
      // Re-check au moment du fire (état peut avoir changé pendant le debounce)
      if (shouldSkipAI(form, isEditMode)) return;

      setIsAILoading(true);
      try {
        const res = await fetch("/api/ai/suggest-toy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toyName: form.nom,
            themeName: profile.label,
            customFieldsDef: profile.custom_fields_definition,
            categorieLegacy: form.categorie || undefined,
            studioLegacy: form.studio || undefined,
            currentValues: {
              category: form._v2_category?.name || null,
              subcategory: form._v2_subcategory?.name || null,
              studio: form._v2_studio?.name || null,
              franchise: form._v2_franchise?.name || null,
              license: form._v2_license?.name || null,
              location: form._v2_location?.name || null,
              characters: form._v2_characters.map((c) => c.name),
              numero: form.numero || null,
              nb_pieces: form.nb_pieces ?? null,
              release_date: form.release_date ?? null,
              taille: form.taille || null,
            },
          }),
        });

        if (!res.ok) return;
        const json = await res.json();
        lastAINameRef.current = normalizedName;

        // Rien de nouveau → stop
        if (json.unchanged || (!json.suggestions?.length && !json.metadata && !json.custom_fields)) {
          return;
        }

        const autoApplied = new Set<string>();
        if (json.suggestions?.length > 0) {
          setForm((prev) => {
            const next = { ...prev };
            json.suggestions.forEach((s: any) => {
              if (s.confidence < 95) return;
              const item = { id: s.id, name: s.name, slug: s.slug || "" };
              if (s.entityType === "category" && !next._v2_category) {
                next._v2_category = item;
                autoApplied.add(`${s.entityType}-${s.id}`);
              } else if (s.entityType === "studio" && !next._v2_studio) {
                next._v2_studio = item;
                autoApplied.add(`${s.entityType}-${s.id}`);
              } else if (s.entityType === "franchise" && !next._v2_franchise) {
                next._v2_franchise = item;
                autoApplied.add(`${s.entityType}-${s.id}`);
              } else if (s.entityType === "license" && !next._v2_license) {
                next._v2_license = item;
                autoApplied.add(`${s.entityType}-${s.id}`);
              } else if (s.entityType === "location" && !next._v2_location) {
                next._v2_location = item;
                autoApplied.add(`${s.entityType}-${s.id}`);
              }
            });
            return next;
          });

          setSuggestions((prev) => {
            const next = [...prev];
            json.suggestions.forEach((s: any) => {
              if (autoApplied.has(`${s.entityType}-${s.id}`)) return;
              if (rejectedSuggestions.has(`${s.entityType}-${s.id}`)) return;

              const isSelected =
                (s.entityType === "category" && form._v2_category?.id === s.id) ||
                (s.entityType === "studio" && form._v2_studio?.id === s.id) ||
                (s.entityType === "franchise" && form._v2_franchise?.id === s.id) ||
                (s.entityType === "license" && form._v2_license?.id === s.id) ||
                (s.entityType === "location" && form._v2_location?.id === s.id) ||
                (s.entityType === "character" && form._v2_characters.some((c) => c.id === s.id));
              if (isSelected) return;

              const existingIdx = next.findIndex(
                (e) => e.entityType === s.entityType && e.item.id === s.id
              );
              const entry: Suggestion = {
                entityType: s.entityType,
                item: { id: s.id, name: s.name, slug: s.slug },
                confidence: s.confidence,
                source: "ai",
              };
              if (existingIdx !== -1) {
                if (s.confidence > (next[existingIdx].confidence ?? 0)) next[existingIdx] = entry;
              } else {
                next.push(entry);
              }
            });
            return next.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
          });
        }

        if (json.metadata || json.custom_fields) {
          setForm((prev) => {
            const next = { ...prev };
            if (json.metadata?.numero && !next.numero) next.numero = json.metadata.numero;
            if (json.metadata?.nb_pieces != null && next.nb_pieces == null) {
              next.nb_pieces = json.metadata.nb_pieces;
            }
            if (json.metadata?.release_date && !next.release_date) {
              next.release_date = json.metadata.release_date;
            }
            if (json.metadata?.taille && !next.taille) next.taille = json.metadata.taille;
            if (json.custom_fields) {
              next.custom_fields_values = {
                ...(next.custom_fields_values || {}),
                ...json.custom_fields,
              };
            }
            return next;
          });
        }
      } catch {
        // silencieux
      } finally {
        setIsAILoading(false);
      }
    }, 1200);

    return () => clearTimeout(handler);
  }, [form.nom, profile.label, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateField<K extends keyof ToyFormValues>(field: K, value: ToyFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSkip(field: FieldKey) {
    setSkippedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function handleAcceptSuggestion(suggestion: Suggestion) {
    const item = suggestion.item as SmartSelectItem;
    switch (suggestion.entityType) {
      case "category":
        updateField("_v2_category", item);
        break;
      case "franchise":
        updateField("_v2_franchise", item);
        break;
      case "studio":
        updateField("_v2_studio", item);
        break;
      case "license":
        updateField("_v2_license", item);
        break;
      case "location":
        updateField("_v2_location", item);
        break;
      case "character":
        if (!form._v2_characters.some((c) => c.id === item.id)) {
          updateField("_v2_characters", [...form._v2_characters, item]);
        }
        break;
    }
    setSuggestions((prev) =>
      prev.filter(
        (s) => !(s.entityType === suggestion.entityType && s.item.id === suggestion.item.id)
      )
    );
  }

  function handleRejectSuggestion(suggestion: Suggestion) {
    setRejectedSuggestions((prev) =>
      new Set(prev).add(`${suggestion.entityType}-${suggestion.item.id}`)
    );
    setSuggestions((prev) =>
      prev.filter(
        (s) => !(s.entityType === suggestion.entityType && s.item.id === suggestion.item.id)
      )
    );
  }

  function handleAcceptAllSuggestions() {
    suggestions.forEach(handleAcceptSuggestion);
  }

  const isPrimary = (field: FieldKey) => profile.primaryFields.includes(field);
  const isInDetails = (field: FieldKey) => profile.detailsFirstFields.includes(field);
  const isHidden = (field: FieldKey) => isFieldHidden(profile, field);

  function lbl(field: FieldKey, defaultLabel: string): string {
    return getFieldLabel(profile, field) ?? defaultLabel;
  }
  function ph(field: FieldKey, defaultPlaceholder: string): string {
    return getFieldPlaceholder(profile, field) ?? defaultPlaceholder;
  }

  return {
    showDetails,
    setShowDetails,
    suggestions,
    skippedFields,
    photoLater,
    setPhotoLater,
    updateField,
    toggleSkip,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleAcceptAllSuggestions,
    isPrimary,
    isInDetails,
    isHidden,
    lbl,
    ph,
    isAILoading,
  };
}

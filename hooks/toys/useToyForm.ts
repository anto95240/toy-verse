import { useState, useEffect } from "react";
import type { Suggestion } from "@/components/ui/SuggestionBanner";
import type { SmartSelectItem } from "@/components/ui/SmartSelect";
import type { FieldKey, ThemeProfile } from "@/lib/themeProfile";
import { isFieldHidden, getFieldLabel, getFieldPlaceholder } from "@/lib/themeProfile";
import type { ToyFormValues } from "@/components/toys/ToyForm";

export function useToyForm(form: ToyFormValues, setForm: React.Dispatch<React.SetStateAction<ToyFormValues>>, profile: ThemeProfile) {
  // ── États locaux ─────────────────────────────────────────────────────────────
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());
  const [skippedFields, setSkippedFields] = useState<Set<FieldKey>>(new Set());
  const [photoLater, setPhotoLater] = useState(false);

  // ── Ouverture automatique des détails ────────────────────────────────────────
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

  // ── Suggestions croisées (personnages) ───────────────────────────────────────
  useEffect(() => {
    if (form._v2_characters.length === 0) { setSuggestions([]); return; }
    const lastChar = form._v2_characters[form._v2_characters.length - 1];
    if (lastChar.id.startsWith("new:")) return;

    fetch("/api/referential/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromEntity: "character", fromId: lastChar.id }),
    })
      .then((r) => r.json())
      .then((json) => {
        const newSuggestions: Suggestion[] = (json.suggestions ?? [])
          .filter((s: Suggestion) => !rejectedSuggestions.has(`${s.entityType}-${s.item.id}`))
          .filter((s: Suggestion) => {
            if (s.entityType === "franchise" && form._v2_franchise?.id === s.item.id) return false;
            if (s.entityType === "studio"    && form._v2_studio?.id    === s.item.id) return false;
            if (s.entityType === "license"   && form._v2_license?.id   === s.item.id) return false;
            return true;
          });
        setSuggestions(newSuggestions);
      })
      .catch(() => setSuggestions([]));
  }, [form._v2_characters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function updateField<K extends keyof ToyFormValues>(field: K, value: ToyFormValues[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSkip(field: FieldKey) {
    setSkippedFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field); else next.add(field);
      return next;
    });
  }

  function handleAcceptSuggestion(suggestion: Suggestion) {
    const item = suggestion.item as SmartSelectItem;
    switch (suggestion.entityType) {
      case "franchise": updateField("_v2_franchise", item); break;
      case "studio":    updateField("_v2_studio",    item); break;
      case "license":   updateField("_v2_license",   item); break;
    }
    setSuggestions((prev) => prev.filter((s) => !(s.entityType === suggestion.entityType && s.item.id === suggestion.item.id)));
  }

  function handleRejectSuggestion(suggestion: Suggestion) {
    setRejectedSuggestions((prev) => new Set(prev).add(`${suggestion.entityType}-${suggestion.item.id}`));
    setSuggestions((prev) => prev.filter((s) => !(s.entityType === suggestion.entityType && s.item.id === suggestion.item.id)));
  }

  function handleAcceptAllSuggestions() { suggestions.forEach(handleAcceptSuggestion); }

  // ── Helpers de rendu ─────────────────────────────────────────────────────────

  const isPrimary   = (field: FieldKey) => profile.primaryFields.includes(field);
  const isInDetails = (field: FieldKey) => profile.detailsFirstFields.includes(field);
  const isHidden    = (field: FieldKey) => isFieldHidden(profile, field);

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
  };
}

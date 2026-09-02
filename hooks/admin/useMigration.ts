import { useState, useEffect, useTransition } from "react";
import { applyMigrationDecisions } from "@/app/actions/referential";
import type { SmartSelectItem } from "@/components/ui/SmartSelect";

export type ConfidenceLevel = "CERTAIN" | "PROBABLE" | "UNKNOWN";

export type ToyAnalysis = {
  toyId: string;
  nom: string;
  themeId: string;
  legacy: { categorie: string | null; studio: string };
  suggestions: {
    entityType: string;
    id: string;
    name: string;
    confidence: number;
    level: ConfidenceLevel;
    source: string;
  }[];
  status: "auto-migrable" | "needs-review" | "unresolved" | "migrated";
  v2_data?: {
    category_ids: { id: string; name: string }[];
    studio_ids: { id: string; name: string }[];
    license_ids: { id: string; name: string }[];
    franchise_ids: { id: string; name: string }[];
    character_ids: { id: string; name: string }[];
    location_ids: { id: string; name: string }[];
  };
};

export type Report = {
  stats: {
    total: number;
    alreadyMigrated: number;
    toAnalyze: number;
    autoMigrable: number;
    needsReview: number;
    unresolved: number;
    generatedAt: string;
  };
  toys: ToyAnalysis[];
};

export type MigrationForm = {
  _v2_category: SmartSelectItem | null;
  _v2_subcategory: SmartSelectItem | null;
  _v2_studio: SmartSelectItem | null;
  _v2_license: SmartSelectItem | null;
  _v2_franchise: SmartSelectItem | null;
  _v2_characters: SmartSelectItem[];
  _v2_location: SmartSelectItem | null;
};

const emptyForm = (): MigrationForm => ({
  _v2_category: null,
  _v2_subcategory: null,
  _v2_studio: null,
  _v2_license: null,
  _v2_franchise: null,
  _v2_characters: [],
  _v2_location: null,
});

export function useMigration() {
  const [report, setReport]           = useState<Report | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [selectedToyId, setSelectedToyId] = useState<string | null>(null);
  const [form, setForm]               = useState<MigrationForm>(emptyForm());
  const [isPending, startTransition]  = useTransition();
  const [applied, setApplied]         = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ToyAnalysis["status"] | "all">("needs-review");

  function notify(message: string) {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  }

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/migration/report");
      if (!res.ok) throw new Error("Impossible de charger le rapport");
      const data: Report = await res.json();
      setReport(data);
      setSelectedToyId(null);
      setForm(emptyForm());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadReport(); }, []);

  const filteredToys = (report?.toys ?? []).filter(
    (t) => statusFilter === "all" || t.status === statusFilter
  ).filter((t) => !applied.has(t.toyId));

  const currentToy = selectedToyId ? filteredToys.find(t => t.toyId === selectedToyId) || null : null;

  // Sélectionner le premier jouet par défaut si rien n'est sélectionné
  useEffect(() => {
    if (!selectedToyId && filteredToys.length > 0) {
      setSelectedToyId(filteredToys[0].toyId);
    } else if (selectedToyId && !filteredToys.find(t => t.toyId === selectedToyId)) {
      setSelectedToyId(filteredToys.length > 0 ? filteredToys[0].toyId : null);
    }
  }, [filteredToys, selectedToyId]);

  // Mettre à jour le formulaire quand le jouet courant change
  useEffect(() => {
    if (!currentToy) {
      setForm(emptyForm());
      return;
    }
    
    const newForm = emptyForm();

    // S'il a déjà des données V2, on pré-remplit avec celles-ci
    if (currentToy.v2_data) {
      const v2 = currentToy.v2_data;
      if (v2.category_ids?.[0]) newForm._v2_category = { id: v2.category_ids[0].id, name: v2.category_ids[0].name, slug: "" };
      if (v2.category_ids?.[1]) newForm._v2_subcategory = { id: v2.category_ids[1].id, name: v2.category_ids[1].name, slug: "" };
      if (v2.studio_ids?.[0]) newForm._v2_studio = { id: v2.studio_ids[0].id, name: v2.studio_ids[0].name, slug: "" };
      if (v2.license_ids?.[0]) newForm._v2_license = { id: v2.license_ids[0].id, name: v2.license_ids[0].name, slug: "" };
      if (v2.franchise_ids?.[0]) newForm._v2_franchise = { id: v2.franchise_ids[0].id, name: v2.franchise_ids[0].name, slug: "" };
      newForm._v2_characters = (v2.character_ids || []).map(c => ({ id: c.id, name: c.name, slug: "" }));
      if (v2.location_ids?.[0]) newForm._v2_location = { id: v2.location_ids[0].id, name: v2.location_ids[0].name, slug: "" };
    } 
    // Sinon on pré-remplit avec les suggestions certaines ou probables
    else {
      for (const s of currentToy.suggestions) {
        if (s.level === "CERTAIN" || s.level === "PROBABLE") {
          const item = { id: s.id, name: s.name, slug: "" };
          if (s.entityType.toLowerCase() === "category") newForm._v2_category = item;
          if (s.entityType.toLowerCase() === "studio") newForm._v2_studio = item;
          if (s.entityType.toLowerCase() === "license") newForm._v2_license = item;
          if (s.entityType.toLowerCase() === "franchise") newForm._v2_franchise = item;
          if (s.entityType.toLowerCase() === "character" && !newForm._v2_characters.find((c) => c.id === s.id)) {
            newForm._v2_characters.push(item);
          }
          if (s.entityType.toLowerCase() === "location") newForm._v2_location = item;
        }
      }
    }
    setForm(newForm);
  }, [currentToy]);

  function updateField<K extends keyof MigrationForm>(field: K, value: MigrationForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applySuggestions() {
    if (!currentToy) return;
    setForm((prev) => {
      const next = { ...prev };
      for (const s of currentToy.suggestions) {
        const item = { id: s.id, name: s.name, slug: "" };
        if (s.entityType.toLowerCase() === "category" && !next._v2_category) next._v2_category = item;
        if (s.entityType.toLowerCase() === "studio" && !next._v2_studio) next._v2_studio = item;
        if (s.entityType.toLowerCase() === "license" && !next._v2_license) next._v2_license = item;
        if (s.entityType.toLowerCase() === "franchise" && !next._v2_franchise) next._v2_franchise = item;
        if (s.entityType.toLowerCase() === "character" && !next._v2_characters.find((c) => c.id === s.id)) {
          next._v2_characters = [...next._v2_characters, item];
        }
        if (s.entityType.toLowerCase() === "location" && !next._v2_location) next._v2_location = item;
      }
      return next;
    });
  }

  async function handleApply() {
    if (!currentToy) return;
    if (!form._v2_category) {
      notify("❌ La catégorie est requise");
      return;
    }
    startTransition(async () => {
      const result = await applyMigrationDecisions({
        toyId: currentToy.toyId,
        category_ids: [
          ...(form._v2_category ? [form._v2_category.id] : []),
          ...(form._v2_subcategory ? [form._v2_subcategory.id] : []),
        ],
        studio_ids: form._v2_studio ? [form._v2_studio.id] : [],
        license_ids: form._v2_license ? [form._v2_license.id] : [],
        franchise_ids: form._v2_franchise ? [form._v2_franchise.id] : [],
        character_ids: form._v2_characters.map((c) => c.id),
        location_ids: form._v2_location ? [form._v2_location.id] : [],
      });
      if (result.success) {
        setApplied((prev) => new Set(prev).add(currentToy.toyId));
        notify(`✅ "${currentToy.nom}" migré avec succès`);
        setForm(emptyForm());
        // Selection is updated via useEffect
      } else {
        notify(`❌ Erreur : ${result.error}`);
      }
    });
  }

  return {
    report,
    loading,
    error,
    selectedToyId,
    setSelectedToyId,
    form,
    updateField,
    isPending,
    notification,
    statusFilter,
    setStatusFilter,
    filteredToys,
    currentToy,
    applySuggestions,
    handleApply,
    loadReport,
  };
}

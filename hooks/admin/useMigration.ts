import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { applyMigrationDecisions } from "@/app/actions/referential";
import type { SmartSelectItem } from "@/components/ui/SmartSelect";
import type { ReferentialEntityKey } from "@/types/theme";
import { resolveManufacturerProfile } from "@/lib/themeProfile";
import { resolveOrCreateReferential } from "@/lib/resolveReferential";

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
  metadata?: {
    numero?: string | null;
    nb_pieces?: number | null;
    release_date?: number | null;
    gift_occasion?: string | null;
    gift_year?: number | null;
    taille?: string | null;
  };
  custom_fields?: Record<string, unknown>;
  themeName?: string;
  profileLabel?: string | null;
  customFieldsDef?: any[];
  storedLicense?: { id: string; name: string } | null;
  storedFranchise?: { id: string; name: string } | null;
  licenseFranchise?: { id: string; name: string } | null;
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
  _v2_franchise: SmartSelectItem | null;
  _v2_characters: SmartSelectItem[];
  _v2_location: SmartSelectItem | null;
  // Métadonnées — déduites par l'IA ou pré-remplies depuis les données existantes
  numero: string | null;
  nb_pieces: number | null;
  release_date: number | null;
  gift_occasion: string | null;
  gift_year: number | null;
  taille: string | null;
};

function normName(value: string | null | undefined): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function storedOf(toy: ToyAnalysis) {
  const license = toy.v2_data?.license_ids?.[0] || toy.storedLicense || null;
  const franchise = toy.v2_data?.franchise_ids?.[0] || toy.storedFranchise || null;
  return { license, franchise };
}

function franchiseItemFromLicense(toy: ToyAnalysis): SmartSelectItem | null {
  const { license } = storedOf(toy);
  if (!license?.name) return null;
  if (toy.licenseFranchise) {
    return { id: toy.licenseFranchise.id, name: toy.licenseFranchise.name, slug: "" };
  }
  return { id: `new:${license.name}`, name: license.name, slug: "" };
}

export type FranchiseConflict = {
  existing: SmartSelectItem;
  fromLicense: SmartSelectItem;
  licenseName: string;
};

function foldName(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

/** Retire les studios concurrents et impose le fabricant du thème. */
function enforceManufacturerSuggestions<T extends { entityType: string; id: string; name: string; confidence: number; level?: string; source?: string }>(
  suggestions: T[],
  themeName?: string | null,
  profileLabel?: string | null
): T[] {
  const profile = resolveManufacturerProfile(themeName || "", profileLabel);
  const candidates = profile.forcedStudioCandidates ?? [];
  if (candidates.length === 0) return suggestions;

  const rest = suggestions.filter((s) => s.entityType !== "studio");
  const exact = suggestions.find(
    (s) => s.entityType === "studio" && candidates.some((candidate) => foldName(candidate) === foldName(s.name))
  );
  const studio = exact
    ? { ...exact, confidence: Math.max(exact.confidence, 99), level: "CERTAIN", source: "Fabricant imposé" }
    : {
        entityType: "studio",
        id: `new:${candidates[0]}`,
        name: candidates[0],
        confidence: 99,
        level: "CERTAIN",
        source: "Fabricant imposé",
      };
  return [...rest, studio as T];
}

const emptyForm = (): MigrationForm => ({
  _v2_category: null,
  _v2_subcategory: null,
  _v2_studio: null,
  _v2_franchise: null,
  _v2_characters: [],
  _v2_location: null,
  numero: null,
  nb_pieces: null,
  release_date: null,
  gift_occasion: null,
  gift_year: null,
  taille: null,
});

export function useMigration() {
  const [report, setReport]                 = useState<Report | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [selectedToyId, setSelectedToyId]   = useState<string | null>(null);
  const [selectedToyIds, setSelectedToyIds] = useState<Set<string>>(new Set());
  const [form, setForm]                     = useState<MigrationForm>(emptyForm());
  const [isPending, startTransition]        = useTransition();
  const [isBulkPending, setBulkPending]     = useState(false);
  const [applied, setApplied]               = useState<Set<string>>(new Set());
  const [notification, setNotification]     = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [franchisePick, setFranchisePick]   = useState<Record<string, "keep" | "license" | "manual">>({});
  const franchisePickRef = useRef(franchisePick);
  franchisePickRef.current = franchisePick;
  const [statusFilter, setStatusFilter]     = useState<ToyAnalysis["status"] | "all">("needs-review");
  const [themeFilter, setThemeFilter]       = useState<string | "all">("all");
  const studioCache = useRef(new Map<string, SmartSelectItem>());

  async function forcedStudioItem(themeName?: string | null, profileLabel?: string | null): Promise<SmartSelectItem | null> {
    const profile = resolveManufacturerProfile(themeName || "", profileLabel);
    const candidates = profile.forcedStudioCandidates ?? [];
    if (candidates.length === 0) return null;
    const key = candidates.join("|");
    const cached = studioCache.current.get(key);
    if (cached) return cached;
    const item = await resolveOrCreateReferential("studio", candidates);
    if (item) studioCache.current.set(key, item);
    return item;
  }

  const [isAIAnalyzing, setIsAIAnalyzing]         = useState<Record<string, boolean>>({});
  const [isBulkAIAnalyzing, setIsBulkAIAnalyzing] = useState(false);
  const [bulkAIProgress, setBulkAIProgress]       = useState<{ done: number; total: number } | null>(null);

  function notify(type: "success" | "error" | "info", message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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
      setSelectedToyIds(new Set());
      setForm(emptyForm());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeWithAI(toyId: string) {
    const toy = report?.toys.find(t => t.toyId === toyId);
    if (!toy) return;

    setIsAIAnalyzing(prev => ({ ...prev, [toyId]: true }));
    try {
      const res = await fetch("/api/ai/migrate-toy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toyId,
          nom: toy.nom,
          categorieLegacy: toy.legacy.categorie,
          studioLegacy: toy.legacy.studio,
          themeName: toy.themeName,
          customFieldsDef: toy.customFieldsDef,
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur IA");
      }

      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setReport(prev => {
          if (!prev) return prev;
          const toys = [...prev.toys];
          const idx = toys.findIndex(t => t.toyId === toyId);
          if (idx !== -1) {
            // Fusion des suggestions
            const existing = [...toys[idx].suggestions];
            const incoming = data.suggestions.map((s: any) =>
              s.entityType === "license"
                ? { ...s, entityType: "franchise", id: `new:${s.name}` }
                : s
            );
            incoming.forEach((s: any) => {
              const eIdx = existing.findIndex(e => e.entityType === s.entityType && e.id === s.id);
              if (eIdx !== -1) {
                if (s.confidence > existing[eIdx].confidence) {
                  existing[eIdx] = { ...s, level: s.confidence >= 90 ? "CERTAIN" : s.confidence >= 60 ? "PROBABLE" : "UNKNOWN" };
                }
              } else {
                existing.push({ ...s, level: s.confidence >= 90 ? "CERTAIN" : s.confidence >= 60 ? "PROBABLE" : "UNKNOWN" });
              }
            });
            const enforced = enforceManufacturerSuggestions(
              existing,
              toys[idx].themeName,
              toys[idx].profileLabel
            );
            existing.splice(0, existing.length, ...enforced);
            existing.sort((a, b) => b.confidence - a.confidence);

            // Déterminer le nouveau statut depuis les suggestions fusionnées
            const hasCertain = existing.some(s => s.level === "CERTAIN");
            const hasCategory = existing.some(s => s.entityType === "category" && s.level === "CERTAIN");
            const allCertain = existing.length > 0 && existing.every(s => s.level === "CERTAIN");
            let newStatus = toys[idx].status;
            if (newStatus !== "migrated") {
              if (allCertain && hasCategory) newStatus = "auto-migrable";
              else if (hasCertain || existing.some(s => s.level === "PROBABLE")) newStatus = "needs-review";
            }

            toys[idx] = { 
              ...toys[idx], 
              suggestions: existing,
              status: newStatus,
              metadata: data.metadata || toys[idx].metadata,
              custom_fields: data.custom_fields || toys[idx].custom_fields,
            };
          }
          return { ...prev, toys };
        });

        // Auto-apply des suggestions à haute confiance (≥90) dans le formulaire
        // si c'est le jouet actuellement sélectionné
        if (toyId === selectedToyId) {
          setForm(prev => {
            const next = { ...prev };
            data.suggestions.forEach((s: any) => {
              if (s.confidence < 90) return;
              const item = { id: s.id, name: s.name, slug: "" };
              if (s.entityType === "category" && !next._v2_category) next._v2_category = item;
              else if (s.entityType === "category" && !next._v2_subcategory) next._v2_subcategory = item;
              if (s.entityType === "subcategory" && !next._v2_subcategory) next._v2_subcategory = item;
              if (s.entityType === "studio" && !resolveManufacturerProfile(toy.themeName || "", toy.profileLabel).forcedStudioName && !next._v2_studio) {
                next._v2_studio = item;
              }
              if ((s.entityType === "franchise" || s.entityType === "license") && !next._v2_franchise) {
                next._v2_franchise = s.entityType === "license" ? { id: `new:${s.name}`, name: s.name, slug: "" } : item;
              }
              if (s.entityType === "character" && !next._v2_characters.find(c => c.id === s.id)) {
                next._v2_characters = [...next._v2_characters, item];
              }
              if (s.entityType === "location"  && !next._v2_location)          next._v2_location = item;
            });
            // Métadonnées IA
            if (data.metadata) {
              if (data.metadata.numero && !next.numero) next.numero = data.metadata.numero;
              if (data.metadata.nb_pieces && !next.nb_pieces) next.nb_pieces = data.metadata.nb_pieces;
              if (data.metadata.release_date && !next.release_date) next.release_date = data.metadata.release_date;
              if (data.metadata.taille && !next.taille) next.taille = data.metadata.taille;
            }
            return next;
          });
        }

        notify("success", `🤖 ${data.suggestions.length} suggestion(s) IA ajoutée(s) !`);
      } else {
        notify("info", "🤖 L'IA n'a rien trouvé de nouveau.");
      }
    } catch (e: any) {
      notify("error", `❌ ${e.message || "L'analyse IA a échoué."}`);
    } finally {
      setIsAIAnalyzing(prev => ({ ...prev, [toyId]: false }));
      // Throttle pour éviter les erreurs 429
      await new Promise(r => setTimeout(r, 3500));
    }
  }

  async function seedFromLegacy() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/referential/seed-from-legacy", {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) {
        notify("error", `❌ Erreur seed : ${data.error}`);
      } else {
        notify("success", `✅ ${data.message}`);
        await loadReport();
      }
    } catch {
      notify("error", "❌ Erreur réseau lors du seed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadReport(); }, []);

  const filteredToys = (report?.toys ?? [])
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .filter((t) => themeFilter === "all" || t.themeId === themeFilter)
    .filter((t) => !applied.has(t.toyId))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base", numeric: true }));

  const currentToy = selectedToyId
    ? filteredToys.find((t) => t.toyId === selectedToyId) || null
    : null;

  const franchiseConflict: FranchiseConflict | null = (() => {
    if (!currentToy) return null;
    const { license, franchise } = storedOf(currentToy);
    const fromLicense = franchiseItemFromLicense(currentToy);
    if (!license || !franchise || !fromLicense) return null;
    if (normName(license.name) === normName(franchise.name)) return null;
    return {
      existing: { id: franchise.id, name: franchise.name, slug: "" },
      fromLicense,
      licenseName: license.name,
    };
  })();

  const licenseNote = (() => {
    if (!currentToy || franchiseConflict) return null;
    const { license, franchise } = storedOf(currentToy);
    if (!license) return null;
    if (franchise && normName(franchise.name) === normName(license.name)) {
      return `La licence « ${license.name} » est déjà la franchise. Elle sera retirée à l'enregistrement.`;
    }
    if (!franchise) {
      return `La licence « ${license.name} » est reprise comme franchise. Elle sera retirée à l'enregistrement.`;
    }
    return null;
  })();

  // Auto-sélection du premier jouet
  useEffect(() => {
    if (!selectedToyId && filteredToys.length > 0) {
      setSelectedToyId(filteredToys[0].toyId);
    } else if (selectedToyId && !filteredToys.find((t) => t.toyId === selectedToyId)) {
      setSelectedToyId(filteredToys.length > 0 ? filteredToys[0].toyId : null);
    }
  }, [filteredToys, selectedToyId]);

  // Pré-remplissage du formulaire
  useEffect(() => {
    if (!currentToy) {
      setForm(emptyForm());
      return;
    }
    const newForm = emptyForm();

    // Pré-remplir les métadonnées depuis le jouet actuel
    if (currentToy.metadata) {
      newForm.numero = currentToy.metadata.numero || null;
      newForm.nb_pieces = currentToy.metadata.nb_pieces || null;
      newForm.release_date = currentToy.metadata.release_date || null;
      newForm.gift_occasion = currentToy.metadata.gift_occasion || null;
      newForm.gift_year = currentToy.metadata.gift_year || null;
      newForm.taille = currentToy.metadata.taille || null;
    }

    if (currentToy.v2_data) {
      const v2 = currentToy.v2_data;
      if (v2.category_ids?.[0]) newForm._v2_category    = { id: v2.category_ids[0].id, name: v2.category_ids[0].name, slug: "" };
      if (v2.category_ids?.[1]) newForm._v2_subcategory = { id: v2.category_ids[1].id, name: v2.category_ids[1].name, slug: "" };
      if (v2.studio_ids?.[0])   newForm._v2_studio      = { id: v2.studio_ids[0].id,   name: v2.studio_ids[0].name,   slug: "" };
      if (v2.franchise_ids?.[0])newForm._v2_franchise   = { id: v2.franchise_ids[0].id,name: v2.franchise_ids[0].name,slug: "" };
      newForm._v2_characters = (v2.character_ids || []).map((c) => ({ id: c.id, name: c.name, slug: "" }));
      if (v2.location_ids?.[0]) newForm._v2_location    = { id: v2.location_ids[0].id, name: v2.location_ids[0].name, slug: "" };
    } else {
      // Suggestions CERTAIN ou PROBABLE → pré-remplir automatiquement
      for (const s of currentToy.suggestions) {
        if (s.level === "CERTAIN" || s.level === "PROBABLE") {
          const item = { id: s.id, name: s.name, slug: "" };
          if (s.entityType.toLowerCase() === "category" && !newForm._v2_category) newForm._v2_category = item;
          else if (s.entityType.toLowerCase() === "category" && !newForm._v2_subcategory) newForm._v2_subcategory = item;
          if (s.entityType.toLowerCase() === "subcategory" && !newForm._v2_subcategory) newForm._v2_subcategory = item;
          if (s.entityType.toLowerCase() === "studio"    && !newForm._v2_studio)             newForm._v2_studio = item;
          if (s.entityType.toLowerCase() === "franchise" && !newForm._v2_franchise)          newForm._v2_franchise = item;
          if (s.entityType.toLowerCase() === "character" && !newForm._v2_characters.find((c) => c.id === s.id)) {
            newForm._v2_characters.push(item);
          }
          if (s.entityType.toLowerCase() === "location"  && !newForm._v2_location)           newForm._v2_location = item;
        }
      }
    }

    const { license, franchise } = storedOf(currentToy);
    const fromLicense = franchiseItemFromLicense(currentToy);
    const conflict =
      !!license &&
      !!franchise &&
      normName(license.name) !== normName(franchise.name);
    const pick = franchisePickRef.current[currentToy.toyId];
    if (conflict && fromLicense && franchise) {
      if (pick === "license") newForm._v2_franchise = fromLicense;
      else if (franchise) newForm._v2_franchise = { id: franchise.id, name: franchise.name, slug: "" };
    } else if (!newForm._v2_franchise && fromLicense) {
      newForm._v2_franchise = fromLicense;
    }

    const forced = resolveManufacturerProfile(currentToy.themeName || "", currentToy.profileLabel);
    if (forced.forcedStudioCandidates?.length) {
      const enforced = enforceManufacturerSuggestions(
        currentToy.suggestions,
        currentToy.themeName,
        currentToy.profileLabel
      );
      const studio = enforced.find((s) => s.entityType === "studio");
      if (studio) newForm._v2_studio = { id: studio.id, name: studio.name, slug: "" };
    }

    setForm(newForm);
  }, [currentToy]);

  function updateField<K extends keyof MigrationForm>(field: K, value: MigrationForm[K]) {
    if (field === "_v2_franchise" && currentToy) {
      setFranchisePick((prev) => ({ ...prev, [currentToy.toyId]: "manual" }));
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function chooseFranchise(which: "keep" | "license") {
    if (!currentToy || !franchiseConflict) return;
    const item = which === "keep" ? franchiseConflict.existing : franchiseConflict.fromLicense;
    setFranchisePick((prev) => ({ ...prev, [currentToy.toyId]: which }));
    setForm((prev) => ({ ...prev, _v2_franchise: item }));
  }

  function applySuggestions() {
    if (!currentToy) return;
    setForm((prev) => {
      const next = { ...prev };
      const forced = resolveManufacturerProfile(currentToy.themeName || "", currentToy.profileLabel);
      const suggestions = enforceManufacturerSuggestions(
        currentToy.suggestions,
        currentToy.themeName,
        currentToy.profileLabel
      );
      for (const s of suggestions) {
        const item = { id: s.id, name: s.name, slug: "" };
        if (s.entityType.toLowerCase() === "category"  && !next._v2_category)  next._v2_category = item;
        if (s.entityType.toLowerCase() === "studio" && (!forced.forcedStudioName ? !next._v2_studio : true)) {
          next._v2_studio = item;
        }
        if (s.entityType.toLowerCase() === "franchise" && !next._v2_franchise) next._v2_franchise = item;
        if (s.entityType.toLowerCase() === "character" && !next._v2_characters.find((c) => c.id === s.id)) {
          next._v2_characters = [...next._v2_characters, item];
        }
        if (s.entityType.toLowerCase() === "location"  && !next._v2_location)  next._v2_location = item;
      }
      
      return next;
    });
  }

  async function handleApply() {
    if (!currentToy) return;
    if (!form._v2_category) {
      notify("error", "❌ La catégorie est requise");
      return;
    }
    if (franchiseConflict && !franchisePick[currentToy.toyId]) {
      notify("error", "Choisis la franchise à conserver : l'actuelle, ou celle reprise de la licence");
      return;
    }
    startTransition(async () => {
      const forcedStudio = await forcedStudioItem(currentToy.themeName, currentToy.profileLabel);
      const result = await applyMigrationDecisions({
        toyId: currentToy.toyId,
        category_ids: [
          ...(form._v2_category ? [form._v2_category.id] : []),
          ...(form._v2_subcategory ? [form._v2_subcategory.id] : []),
        ],
        studio_ids:    forcedStudio ? [forcedStudio.id] : (form._v2_studio ? [form._v2_studio.id] : []),
        franchise_ids: form._v2_franchise ? [form._v2_franchise.id] : [],
        character_ids: form._v2_characters.map((c) => c.id),
        location_ids:  form._v2_location  ? [form._v2_location.id]  : [],
        // Métadonnées déduites par l'IA
        numero: form.numero,
        nb_pieces: form.nb_pieces,
        release_date: form.release_date,
        gift_occasion: form.gift_occasion,
        gift_year: form.gift_year,
        taille: form.taille,
      });
      if (result.success) {
        setApplied((prev) => new Set(prev).add(currentToy.toyId));
        setSelectedToyIds((prev) => { const n = new Set(prev); n.delete(currentToy.toyId); return n; });
        notify("success", `✅ "${currentToy.nom}" migré avec succès`);
        setForm(emptyForm());
      } else {
        notify("error", `❌ Erreur : ${result.error}`);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SÉLECTION MULTIPLE
  // ═══════════════════════════════════════════════════════════════════════════

  const toggleSelectToy = useCallback((toyId: string) => {
    setSelectedToyIds((prev) => {
      const next = new Set(prev);
      if (next.has(toyId)) next.delete(toyId);
      else next.add(toyId);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedToyIds(new Set(filteredToys.map((t) => t.toyId)));
  }, [filteredToys]);

  const deselectAll = useCallback(() => {
    setSelectedToyIds(new Set());
  }, []);

  // Migration groupée : applique les suggestions CERTAINES pour chaque jouet sélectionné
  async function handleBulkApply() {
    const toProcess = filteredToys.filter(
      (t) => selectedToyIds.has(t.toyId) && t.status === "auto-migrable"
    );

    if (toProcess.length === 0) {
      notify("info", "ℹ️ Aucun jouet auto-migrable dans la sélection");
      return;
    }

    setBulkPending(true);
    let successCount = 0;
    let errorCount = 0;
    let skippedChoice = 0;

    for (const toy of toProcess) {
      const { license, franchise } = storedOf(toy);
      const namesDiffer = !!license && !!franchise && normName(license.name) !== normName(franchise.name);
      if (namesDiffer) { skippedChoice++; continue; }

      const certains = toy.suggestions.filter((s) => s.level === "CERTAIN");
      const categoryIds = [
        ...certains.filter((s) => s.entityType === "category").map((s) => s.id),
        ...certains.filter((s) => s.entityType === "subcategory").map((s) => s.id),
      ];
      if (categoryIds.length === 0) { errorCount++; continue; }

      const franchiseIds = certains.filter((s) => s.entityType === "franchise").map((s) => s.id);
      if (franchiseIds.length === 0 && license && !franchise) {
        const carried = franchiseItemFromLicense(toy);
        if (carried) franchiseIds.push(carried.id);
      } else if (franchise && franchiseIds.length === 0) {
        franchiseIds.push(franchise.id);
      }

      const forcedStudio = await forcedStudioItem(toy.themeName, toy.profileLabel);
      const studioIds = forcedStudio
        ? [forcedStudio.id]
        : certains.filter((s) => s.entityType === "studio").map((s) => s.id);

      const result = await applyMigrationDecisions({
        toyId: toy.toyId,
        category_ids:  categoryIds,
        studio_ids:    studioIds,
        franchise_ids: franchiseIds,
        character_ids: certains.filter((s) => s.entityType === "character").map((s) => s.id),
        location_ids:  certains.filter((s) => s.entityType === "location").map((s) => s.id),
        // Métadonnées depuis les données existantes
        numero:       toy.metadata?.numero || null,
        nb_pieces:    toy.metadata?.nb_pieces || null,
        release_date: toy.metadata?.release_date ? Number(toy.metadata.release_date) : null,
        taille:       toy.metadata?.taille || null,
      });

      if (result.success) {
        setApplied((prev) => new Set(prev).add(toy.toyId));
        successCount++;
      } else {
        errorCount++;
      }
    }

    setSelectedToyIds(new Set());
    setBulkPending(false);

    const choiceNote = skippedChoice > 0 ? ` · ${skippedChoice} laissé(s) de côté (licence et franchise différentes)` : "";
    if (errorCount === 0) {
      notify("success", `✅ ${successCount} jouet(s) migré(s) avec succès${choiceNote}`);
    } else {
      notify("info", `✅ ${successCount} succès / ❌ ${errorCount} erreur(s)${choiceNote}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYSE IA EN MASSE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Analyse tous les jouets non-migrés du filtre actuel avec l'IA, un par un.
   * Throttle 3.5s entre chaque appel pour éviter les erreurs 429.
   * Met à jour le statut de chaque jouet au fil de l'eau.
   */
  async function analyzeAllWithAI() {
    const toAnalyze = filteredToys.filter(
      (t) => t.status !== "migrated" && !isAIAnalyzing[t.toyId]
    );

    if (toAnalyze.length === 0) {
      notify("info", "ℹ️ Aucun jouet à analyser.");
      return;
    }

    setIsBulkAIAnalyzing(true);
    setBulkAIProgress({ done: 0, total: toAnalyze.length });

    for (let i = 0; i < toAnalyze.length; i++) {
      const toy = toAnalyze[i];
      setBulkAIProgress({ done: i, total: toAnalyze.length });
      await analyzeWithAI(toy.toyId);
      // analyzeWithAI contient déjà un throttle de 3.5s interne
    }

    setIsBulkAIAnalyzing(false);
    setBulkAIProgress(null);
    notify("success", `🤖 Analyse terminée : ${toAnalyze.length} jouet(s) analysé(s) !`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRÉATION D'ENTITÉ INLINE
  // ═══════════════════════════════════════════════════════════════════════════

  async function createEntityInline(
    entityType: ReferentialEntityKey,
    name: string,
    parentId?: string | null
  ): Promise<SmartSelectItem | null> {
    try {
      const res = await fetch("/api/admin/migration/create-entity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, name, parentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        notify("error", `❌ Erreur création : ${data.error}`);
        return null;
      }
      notify("success", `✅ "${name}" créé avec succès`);
      return { id: data.entity.id, name: data.entity.name, slug: data.entity.slug };
    } catch {
      notify("error", "❌ Erreur réseau lors de la création");
      return null;
    }
  }

  return {
    report,
    loading,
    error,
    selectedToyId,
    setSelectedToyId,
    selectedToyIds,
    toggleSelectToy,
    selectAll,
    deselectAll,
    form,
    updateField,
    franchiseConflict,
    franchisePick: currentToy ? franchisePick[currentToy.toyId] : undefined,
    chooseFranchise,
    licenseNote,
    isPending,
    isBulkPending,
    notification,
    statusFilter,
    setStatusFilter,
    themeFilter,
    setThemeFilter,
    filteredToys,
    currentToy,
    applySuggestions,
    handleApply,
    handleBulkApply,
    createEntityInline,
    loadReport,
    seedFromLegacy,
    analyzeWithAI,
    analyzeAllWithAI,
    isAIAnalyzing,
    isBulkAIAnalyzing,
    bulkAIProgress,
  };
}

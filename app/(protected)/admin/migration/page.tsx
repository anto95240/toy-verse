"use client";

/**
 * app/(protected)/admin/migration/page.tsx
 *
 * Interface de validation semi-guidée de la migration legacy → V2.
 * L'utilisateur valide ou rejette chaque suggestion jouet par jouet.
 * Aucune modification irréversible sans confirmation explicite.
 */

import React, { useState, useEffect, useTransition } from "react";
import { applyMigrationDecisions } from "@/app/actions/referential";
import type { ReferentialEntityKey } from "@/types/theme";

// =============================================================================
// Types (mirror du rapport JSON généré par analyze-legacy-data.ts)
// =============================================================================

type ConfidenceLevel = "CERTAIN" | "PROBABLE" | "UNKNOWN";

type ToyAnalysis = {
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
  status: "auto-migrable" | "needs-review" | "unresolved";
};

type Report = {
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

// =============================================================================
// Composant
// =============================================================================

export default function MigrationPage() {
  const [report, setReport]           = useState<Report | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions]     = useState<Record<string, "confirm" | "reject">>({});
  const [isPending, startTransition]  = useTransition();
  const [applied, setApplied]         = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ToyAnalysis["status"] | "all">("needs-review");

  function notify(message: string) {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  }

  // Charger le rapport via l'API
  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/migration/report");
      if (!res.ok) throw new Error("Impossible de charger le rapport");
      const data: Report = await res.json();
      setReport(data);
      setCurrentIndex(0);
      setDecisions({});
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

  const currentToy = filteredToys[currentIndex];

  function setDecision(suggestionId: string, action: "confirm" | "reject") {
    setDecisions((prev) => ({ ...prev, [suggestionId]: action }));
  }

  function confirmAll() {
    if (!currentToy) return;
    const next: Record<string, "confirm" | "reject"> = { ...decisions };
    for (const s of currentToy.suggestions) next[s.id] = "confirm";
    setDecisions(next);
  }

  async function handleApply() {
    if (!currentToy) return;
    const toyDecisions = currentToy.suggestions.map((s) => ({
      entityType: s.entityType as ReferentialEntityKey,
      entityId:   s.id,
      action:     decisions[s.id] ?? "reject",
    }));

    startTransition(async () => {
      const result = await applyMigrationDecisions({
        toyId:    currentToy.toyId,
        decisions: toyDecisions,
      });
      if (result.success) {
        setApplied((prev) => new Set(prev).add(currentToy.toyId));
        notify(`✅ "${currentToy.nom}" migré avec succès`);
        // Passer au jouet suivant
        setDecisions({});
        if (currentIndex < filteredToys.length - 2) setCurrentIndex((i) => i + 1);
        else setCurrentIndex(0);
      } else {
        notify(`❌ Erreur : ${result.error}`);
      }
    });
  }

  // =============================================================================
  // Rendu
  // =============================================================================

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Migration des données</h1>
        <p className="text-sm text-gray-400 mt-1">
          Validez ou rejetez les suggestions de migration legacy → V2 jouet par jouet.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className="px-4 py-3 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm">
          {notification}
        </div>
      )}

      {/* Statistiques */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={report.stats.total} color="text-white" />
          <StatCard label="Déjà migrés" value={report.stats.alreadyMigrated} color="text-green-400" />
          <StatCard label="Auto-migrables" value={report.stats.autoMigrable} color="text-blue-400" />
          <StatCard label="À valider" value={report.stats.needsReview} color="text-amber-400" />
        </div>
      )}

      {/* Filtre */}
      {report && (
        <div className="flex gap-2 flex-wrap">
          {(["needs-review", "auto-migrable", "unresolved", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentIndex(0); setDecisions({}); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s === "needs-review"   ? "⚠️ À valider"      : ""}
              {s === "auto-migrable"  ? "✅ Auto-migrables"  : ""}
              {s === "unresolved"     ? "❌ Non résolus"     : ""}
              {s === "all"            ? "Tous"              : ""}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Analyse en cours...
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 text-sm">
          {error}
          <button onClick={loadReport} className="ml-3 underline hover:no-underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Jouet courant */}
      {!loading && !error && currentToy && (
        <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 space-y-5">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Jouet {currentIndex + 1} / {filteredToys.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => { setCurrentIndex((i) => Math.max(0, i - 1)); setDecisions({}); }}
                disabled={currentIndex === 0}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                ← Précédent
              </button>
              <button
                onClick={() => { setCurrentIndex((i) => Math.min(filteredToys.length - 1, i + 1)); setDecisions({}); }}
                disabled={currentIndex === filteredToys.length - 1}
                className="px-2 py-1 text-xs text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>

          {/* Info jouet */}
          <div>
            <h2 className="text-xl font-bold text-white">{currentToy.nom}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-400">
              <p>Catégorie (legacy) : <span className="text-gray-300 font-mono">{currentToy.legacy.categorie ?? "—"}</span></p>
              <p>Studio (legacy) : <span className="text-gray-300 font-mono">{currentToy.legacy.studio || "—"}</span></p>
            </div>
          </div>

          {/* Suggestions */}
          {currentToy.suggestions.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Suggestions de migration</h3>
                <button
                  onClick={confirmAll}
                  className="text-xs text-green-400 hover:text-green-300 border border-green-400/30 px-2 py-1 rounded transition-all"
                >
                  Tout confirmer
                </button>
              </div>

              {currentToy.suggestions.map((s) => {
                const decision = decisions[s.id];
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      decision === "confirm"
                        ? "border-green-400/30 bg-green-500/10"
                        : decision === "reject"
                        ? "border-red-400/20 bg-red-500/5 opacity-60"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500 uppercase">{s.entityType} ·</span>{" "}
                      <span className="font-medium text-white">{s.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{s.source}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${
                      s.level === "CERTAIN"  ? "bg-green-500/20 text-green-400"  :
                      s.level === "PROBABLE" ? "bg-amber-500/20 text-amber-400"  :
                                               "bg-gray-500/20  text-gray-400"
                    }`}>
                      {s.confidence}%
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setDecision(s.id, decision === "confirm" ? "reject" : "confirm")}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          decision === "confirm"
                            ? "bg-green-600 text-white"
                            : "bg-white/10 text-gray-300 hover:bg-green-600/30 hover:text-green-300"
                        }`}
                      >
                        ✓ Confirmer
                      </button>
                      <button
                        onClick={() => setDecision(s.id, decision === "reject" ? "reject" : "reject")}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          decision === "reject"
                            ? "bg-red-600/50 text-red-300"
                            : "bg-white/5 text-gray-500 hover:bg-red-600/20 hover:text-red-400"
                        }`}
                      >
                        ✕ Rejeter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Aucune suggestion automatique — données legacy non reconnues.
            </p>
          )}

          {/* Bouton Appliquer */}
          <div className="flex justify-end">
            <button
              onClick={handleApply}
              disabled={isPending}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              {isPending ? "Application..." : "Appliquer & Suivant →"}
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filteredToys.length === 0 && report && (
        <div className="text-center py-12 text-gray-400 text-sm">
          🎉 Tous les jouets de cette catégorie sont traités !
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

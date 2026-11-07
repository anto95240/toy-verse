"use client";

/**
 * app/(protected)/admin/migration/page.tsx
 *
 * Interface de migration legacy → V2.
 * - Split-pane : liste à gauche, éditeur à droite
 * - Sélection multiple + migration groupée
 * - Création d'entités inline
 */

import React, { useState } from "react";
import { useMigration } from "@/hooks/admin/useMigration";
import SmartSelect from "@/components/ui/SmartSelect";
import SmartSelectMulti from "@/components/ui/SmartSelectMulti";
import Modal from "@/components/ui/Modal";
import type { ReferentialEntityKey } from "@/types/theme";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "migrated":      { icon: "☑️", label: "Déjà migré",    cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  "auto-migrable": { icon: "✅", label: "Auto-migrable", cls: "bg-blue-500/20   text-blue-300   border-blue-500/30"    },
  "needs-review":  { icon: "⚠️", label: "À valider",     cls: "bg-amber-500/20  text-amber-300  border-amber-500/30"   },
  "unresolved":    { icon: "❌", label: "Non résolu",    cls: "bg-red-500/20    text-red-300    border-red-500/30"     },
} as const;

const FILTER_OPTIONS = ["needs-review", "auto-migrable", "unresolved", "migrated", "all"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export default function MigrationPage() {
  const {
    report, loading, error,
    selectedToyId, setSelectedToyId,
    selectedToyIds, toggleSelectToy, selectAll, deselectAll,
    form, updateField, isPending, isBulkPending,
    notification, statusFilter, setStatusFilter, themeFilter, setThemeFilter,
    filteredToys, currentToy,
    applySuggestions, handleApply, handleBulkApply,
    createEntityInline, loadReport, seedFromLegacy,
    analyzeWithAI, analyzeAllWithAI, isAIAnalyzing, isBulkAIAnalyzing, bulkAIProgress
  } = useMigration();

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createEntityType, setCreateEntityType] = useState<ReferentialEntityKey>("category");
  const [createEntityName, setCreateEntityName] = useState("");
  const [createParentId, setCreateParentId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [detailsModalToy, setDetailsModalToy] = useState<any | null>(null);

  const isAllSelected = filteredToys.length > 0 && filteredToys.every((t) => selectedToyIds.has(t.toyId));
  const bulkCount = filteredToys.filter((t) => selectedToyIds.has(t.toyId) && t.status === "auto-migrable").length;

  async function handleCreateEntity() {
    if (!createEntityName.trim()) return;
    setIsCreating(true);
    await createEntityInline(createEntityType, createEntityName, createParentId || null);
    setCreateEntityName("");
    setCreateParentId("");
    setIsCreating(false);
    setShowCreatePanel(false);
  }

  const themes = Array.from(new Set(report?.toys.map(t => t.themeId) || [])).filter(Boolean);
  const getThemeName = (themeId: string) => report?.toys.find(t => t.themeId === themeId)?.themeName || themeId;

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6 pb-12">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Migration des données</h1>
          <p className="text-sm text-gray-400 mt-1">
            Validez et assignez le nouveau référentiel V2 aux anciens jouets.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            className="px-3 py-2 text-sm rounded-lg border border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all"
          >
            Créer entité
          </button>
          <button
            onClick={seedFromLegacy}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            title="Importe automatiquement les catégories et studios depuis vos jouets existants"
          >
            Importer legacy
          </button>
          <button
            onClick={analyzeAllWithAI}
            disabled={loading || isBulkAIAnalyzing || filteredToys.filter(t => t.status !== "migrated").length === 0}
            className="px-3 py-2 text-sm rounded-lg border border-indigo-400/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            title="Analyse tous les jouets visibles avec l'IA Gemini"
          >
            {isBulkAIAnalyzing && bulkAIProgress ? (
              <>
                <span className="animate-spin text-xs">⟳</span>
                IA {bulkAIProgress.done}/{bulkAIProgress.total}
              </>
            ) : (
              "🤖 Analyser tout"
            )}
          </button>
          <button
            onClick={loadReport}
            className="px-3 py-2 text-sm rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            Recharger
          </button>
        </div>
      </div>

      {/* ── BARRE DE PROGRESSION ANALYSE IA EN MASSE ── */}
      {isBulkAIAnalyzing && bulkAIProgress && (
        <div className="px-4 py-3 rounded-xl border border-indigo-400/30 bg-indigo-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-300 flex items-center gap-2">
              <span className="animate-pulse">🤖</span>
              Analyse IA en cours… ({bulkAIProgress.done}/{bulkAIProgress.total} jouets)
            </span>
            <span className="text-xs text-indigo-400/70">
              ~{Math.round((bulkAIProgress.total - bulkAIProgress.done) * 3.5)}s restantes
            </span>
          </div>
          <div className="w-full bg-indigo-900/40 rounded-full h-1.5">
            <div
              className="bg-indigo-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((bulkAIProgress.done / bulkAIProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ── NOTIFICATION ── */}
      {notification && (
        <div className={`px-4 py-3 rounded-xl text-sm border transition-all ${
          notification.type === "success" ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300" :
          notification.type === "error"   ? "bg-red-500/15     border-red-400/30     text-red-300"     :
                                            "bg-blue-500/15    border-blue-400/30    text-blue-300"
        }`}>
          {notification.message}
        </div>
      )}

      {/* ── STATS ── */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <StatCard label="Total"          value={report.stats.total}                                                      cls="text-white"         />
          <StatCard label="Déjà migrés"    value={report.toys.filter(t => t.status === "migrated").length}                 cls="text-emerald-400"   />
          <StatCard label="Auto-migrables" value={report.toys.filter(t => t.status === "auto-migrable").length}            cls="text-blue-400"      />
          <StatCard label="À valider"      value={report.toys.filter(t => t.status === "needs-review").length}             cls="text-amber-400"     />
          <StatCard label="Non résolus"    value={report.toys.filter(t => t.status === "unresolved").length}               cls="text-red-400"       />
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadReport} className="underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {/* ── PANNEAU CRÉATION D'ENTITÉ ── */}
      {showCreatePanel && (
        <div className="rounded-2xl border border-purple-400/20 bg-purple-500/5 backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-purple-300">Créer une nouvelle entité de référentiel</h3>
            <button onClick={() => setShowCreatePanel(false)} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Type d&apos;entité</label>
              <select
                value={createEntityType}
                onChange={(e) => setCreateEntityType(e.target.value as ReferentialEntityKey)}
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="category">Catégorie</option>
                <option value="studio">Studio</option>
                <option value="license">Licence</option>
                <option value="franchise">Franchise</option>
                <option value="character">Personnage</option>
                <option value="location">Lieu d&apos;achat</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 font-medium">Nom *</label>
              <input
                value={createEntityName}
                onChange={(e) => setCreateEntityName(e.target.value)}
                placeholder="Ex: Figurine articulée"
                className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                onKeyDown={(e) => e.key === "Enter" && handleCreateEntity()}
              />
            </div>
            {createEntityType === "category" && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium">ID parent (optionnel)</label>
                <input
                  value={createParentId}
                  onChange={(e) => setCreateParentId(e.target.value)}
                  placeholder="cat_xxx (sous-catégorie)"
                  className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleCreateEntity}
            disabled={!createEntityName.trim() || isCreating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isCreating ? "Création..." : "Créer l'entité"}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Analyse en cours...</span>
          </div>
        </div>
      )}

      {/* ── SELECTION DE THEMES OU SPLIT-PANE ── */}
      {!loading && !error && report && (
        themeFilter === "all" ? (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-white border-b border-white/10 pb-2">Choisissez un thème à migrer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {themes.map(tId => {
                const count = report.toys.filter(t => t.themeId === tId && t.status !== "migrated").length;
                return (
                  <button
                    key={tId}
                    onClick={() => setThemeFilter(tId)}
                    className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group text-left"
                  >
                    <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{getThemeName(tId)}</span>
                    <span className="text-sm text-gray-400">{count} jouet(s) à valider</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => { setThemeFilter("all"); setSelectedToyId(null); }}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-sm transition-all"
              >
                &larr; Retour aux thèmes
              </button>
              <h2 className="text-xl font-bold text-white">{getThemeName(themeFilter)}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* ── PANNEAU GAUCHE ── */}
              <div className="lg:col-span-4 space-y-3">

            {/* Filtres */}
            <div className="flex gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setSelectedToyId(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    statusFilter === s
                      ? "bg-white/15 text-white border-white/30 shadow-sm"
                      : "bg-white/3 text-gray-400 border-white/10 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.icon ?? ""}{" "}
                  {s === "needs-review"   ? "À valider"       :
                   s === "auto-migrable"  ? "Auto-migrables"  :
                   s === "unresolved"     ? "Non résolus"     :
                   s === "migrated"       ? "Déjà migrés"     : "Tous"}
                </button>
              ))}
            </div>

            {/* Barre d'actions groupées */}
            {selectedToyIds.size > 0 && (
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-blue-400/30 bg-blue-500/10">
                <span className="text-xs text-blue-300 font-medium">
                  {selectedToyIds.size} jouet(s) sélectionné(s)
                  {bulkCount > 0 && ` · ${bulkCount} auto-migrables`}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={deselectAll}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Désélectionner
                  </button>
                  {bulkCount > 0 && (
                      <button
                        onClick={handleBulkApply}
                        disabled={isBulkPending}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all disabled:opacity-50"
                      >
                        {isBulkPending ? "Migration..." : `Migrer ${bulkCount}`}
                      </button>
                  )}
                </div>
              </div>
            )}

            {/* Liste */}
            <div className="rounded-xl border border-white/10 bg-white/3 flex flex-col" style={{ height: "60vh", minHeight: "400px" }}>
              {/* Header liste */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
                <span className="text-xs text-gray-400 font-medium">{filteredToys.length} jouet(s)</span>
                {filteredToys.length > 0 && (
                  <button
                    onClick={isAllSelected ? deselectAll : selectAll}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredToys.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
                    Aucun jouet dans ce filtre.
                  </div>
                ) : (
                  filteredToys.map((toy) => {
                    const isActive  = selectedToyId === toy.toyId;
                    const isChecked = selectedToyIds.has(toy.toyId);
                    const cfg = STATUS_CONFIG[toy.status];
                    return (
                      <div
                        key={toy.toyId}
                        className={`group flex items-start gap-2.5 p-3 rounded-lg border transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-500/20 border-blue-500/50"
                            : isChecked
                            ? "bg-white/8  border-white/20"
                            : "bg-white/3  border-white/8 hover:bg-white/8 hover:border-white/15"
                        }`}
                        onClick={() => setSelectedToyId(toy.toyId)}
                      >
                        {/* Checkbox sélection multiple */}
                        <div
                          className="shrink-0 mt-0.5"
                          onClick={(e) => { e.stopPropagation(); toggleSelectToy(toy.toyId); }}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            isChecked
                              ? "bg-blue-500 border-blue-500"
                              : "border-white/30 hover:border-blue-400"
                          }`}>
                            {isChecked && <span className="text-white text-[10px] leading-none">✓</span>}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="text-sm font-medium text-white line-clamp-1">{toy.nom}</span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDetailsModalToy(toy); }}
                                className="shrink-0 px-1.5 py-0.5 bg-blue-500/10 text-blue-300 text-[10px] font-medium rounded hover:bg-blue-500/20 transition-all border border-blue-500/20"
                                title="Voir tous les détails"
                              >
                                Détails
                              </button>
                            </div>
                            <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cfg?.cls ?? ""}`}>
                              {cfg?.icon}
                            </span>
                          </div>
                          {toy.status === "migrated" && toy.v2_data ? (
                            <div className="text-[11px] text-emerald-400 mt-0.5 line-clamp-1">
                              {toy.v2_data.category_ids?.[0]?.name || "Sans cat."} · {toy.v2_data.studio_ids?.[0]?.name || "Sans studio"}
                            </div>
                          ) : (
                            <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                              {toy.legacy.categorie || "—"} · {toy.legacy.studio || "—"}
                            </div>
                          )}
                          {toy.suggestions.length > 0 && (
                            <div className="text-[11px] text-blue-400/70 mt-0.5">
                              {toy.suggestions.length} suggestion(s)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── PANNEAU DROITE ── */}
          <div className="lg:col-span-8">
            {currentToy ? (
              <div className="rounded-2xl border border-white/15 bg-white/3 backdrop-blur-sm p-6 space-y-6 shadow-2xl sticky top-6">

                {/* En-tête du jouet */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{currentToy.nom}</h2>
                    <span className={`px-2 py-0.5 text-xs rounded-full border font-medium ${STATUS_CONFIG[currentToy.status]?.cls}`}>
                      {STATUS_CONFIG[currentToy.status]?.icon} {STATUS_CONFIG[currentToy.status]?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 bg-black/20 px-4 py-3 rounded-xl border border-white/5">
                    <span>Catégorie legacy : <code className="text-gray-200 font-mono text-xs">{currentToy.legacy.categorie ?? "—"}</code></span>
                    <span>Studio legacy : <code className="text-gray-200 font-mono text-xs">{currentToy.legacy.studio || "—"}</code></span>
                  </div>
                  
                  {/* Informations supplémentaires en lecture seule */}
                  <div className="flex flex-wrap gap-2">
                    {currentToy.metadata?.numero && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">N° {currentToy.metadata.numero}</span>}
                    {currentToy.metadata?.nb_pieces && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">{currentToy.metadata.nb_pieces} pcs</span>}
                    {currentToy.metadata?.release_date && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">Année {currentToy.metadata.release_date}</span>}
                    {currentToy.metadata?.taille && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">Taille: {currentToy.metadata.taille}</span>}
                    {currentToy.custom_fields && Object.entries(currentToy.custom_fields).map(([key, val]) => (
                      <span key={key} className="text-xs bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 text-purple-300">
                        {currentToy.customFieldsDef?.find(f => f.id === key)?.label || key} : {val as React.ReactNode}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {currentToy.status !== "migrated" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-white">
                          Suggestions ({currentToy.suggestions.length})
                        </h3>
                        <button
                          onClick={() => analyzeWithAI(currentToy.toyId)}
                          disabled={isAIAnalyzing[currentToy.toyId]}
                          className="px-2.5 py-1 text-xs rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                        >
                          {isAIAnalyzing[currentToy.toyId] ? "Analyse en cours..." : "🤖 Analyser avec l'IA"}
                        </button>
                      </div>
                      {currentToy.suggestions.length > 0 && (
                        <button
                          onClick={applySuggestions}
                          className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-lg transition-all bg-emerald-400/8 hover:bg-emerald-400/15"
                        >
                          Appliquer tout
                        </button>
                      )}
                    </div>
                    {currentToy.suggestions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentToy.suggestions.map((s, idx) => (
                        <div
                          key={`${s.id}-${idx}`}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-white/8 bg-black/20"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{s.entityType}</div>
                              {s.source === "ai" && <span title="Suggestion IA" className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">🤖 IA</span>}
                            </div>
                            <div className="text-sm text-white font-medium line-clamp-1">{s.name}</div>
                            <div className="text-[10px] text-gray-600 line-clamp-1 mt-0.5">{s.source}</div>
                          </div>
                          <div className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.level === "CERTAIN"  ? "bg-emerald-500/20 text-emerald-300" :
                            s.level === "PROBABLE" ? "bg-amber-500/20   text-amber-300"   :
                                                     "bg-gray-500/20    text-gray-400"
                          }`}>
                            {s.confidence}%
                          </div>
                        </div>
                      ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic py-2">
                        Aucune suggestion pour le moment. Lancez l'analyse IA.
                      </div>
                    )}
                  </div>
                )}

                {/* Formulaire V2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Validation V2</h3>
                    {currentToy.status === "migrated" && (
                      <span className="text-xs text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        Mode modification
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SmartSelect
                      id="category"
                      entityType="category"
                      label="Catégorie *"
                      placeholder="Sélectionner (requis)"
                      value={form._v2_category}
                      onChange={(item) => {
                        updateField("_v2_category", item);
                        if (!item || item.id !== form._v2_category?.id) updateField("_v2_subcategory", null);
                      }}
                      required
                      disabled={isPending}
                    />
                    <SmartSelect
                      id="subcategory"
                      entityType="category"
                      label="Sous-catégorie"
                      placeholder={form._v2_category ? `Sous-cat. de ${form._v2_category.name}...` : "Catégorie requise..."}
                      value={form._v2_subcategory}
                      onChange={(item) => updateField("_v2_subcategory", item)}
                      disabled={isPending || !form._v2_category}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SmartSelect
                      id="studio"
                      entityType="studio"
                      label="Studio"
                      placeholder="Rechercher..."
                      value={form._v2_studio}
                      onChange={(item) => updateField("_v2_studio", item)}
                      disabled={isPending}
                    />
                    <SmartSelect
                      id="franchise"
                      entityType="franchise"
                      label="Franchise"
                      placeholder="Rechercher..."
                      value={form._v2_franchise}
                      onChange={(item) => updateField("_v2_franchise", item)}
                      disabled={isPending}
                    />
                  </div>

                  <details className="group border border-white/10 bg-white/5 rounded-xl open:bg-white/10 transition-all mt-4">
                    <summary className="px-4 py-3 text-sm font-medium text-gray-300 cursor-pointer hover:text-white flex items-center justify-between">
                      Plus de détails (Licence, Lieu, Personnages)
                      <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="p-4 pt-2 border-t border-white/10 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SmartSelect
                          id="license"
                          entityType="license"
                          label="Licence"
                          placeholder="Rechercher..."
                          value={form._v2_license}
                          onChange={(item) => updateField("_v2_license", item)}
                          disabled={isPending}
                        />
                        <SmartSelect
                          id="location"
                          entityType="location"
                          label="Lieu d'achat"
                          placeholder="Rechercher..."
                          value={form._v2_location}
                          onChange={(item) => updateField("_v2_location", item)}
                          disabled={isPending}
                        />
                      </div>
                      <SmartSelectMulti
                        id="characters"
                        entityType="character"
                        label="Personnage(s)"
                        placeholder="Ajouter des personnages..."
                        values={form._v2_characters}
                        onChange={(items) => updateField("_v2_characters", items)}
                        disabled={isPending}
                      />

                      {/* Métadonnées IA — modifiables avant sauvegarde */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Métadonnées IA</h4>
                          {(form.numero || form.nb_pieces || form.release_date || form.taille) && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">🤖 déduit</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500 uppercase tracking-wider">N° de réf.</label>
                            <input
                              type="text"
                              value={form.numero || ""}
                              onChange={(e) => updateField("numero", e.target.value || null)}
                              placeholder="Ex: 42173"
                              disabled={isPending}
                              className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500 uppercase tracking-wider">Pièces</label>
                            <input
                              type="number"
                              value={form.nb_pieces || ""}
                              onChange={(e) => updateField("nb_pieces", e.target.value ? Number(e.target.value) : null)}
                              placeholder="Ex: 1267"
                              disabled={isPending}
                              className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500 uppercase tracking-wider">Année</label>
                            <input
                              type="number"
                              value={form.release_date || ""}
                              onChange={(e) => updateField("release_date", e.target.value ? Number(e.target.value) : null)}
                              placeholder="Ex: 2023"
                              disabled={isPending}
                              className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-500 uppercase tracking-wider">Taille</label>
                            <input
                              type="text"
                              value={form.taille || ""}
                              onChange={(e) => updateField("taille", e.target.value || null)}
                              placeholder="Ex: 1/18ème"
                              disabled={isPending}
                              className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-xs text-gray-500">
                    {!form._v2_category && "Catégorie requise pour sauvegarder"}
                  </div>
                  <button
                    onClick={handleApply}
                    disabled={isPending || !form._v2_category}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isPending ? (
                      <>
                        <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                        Application...
                      </>
                    ) : (
                      "Sauvegarder en base"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/15 rounded-2xl bg-white/3 flex flex-col items-center justify-center text-gray-500 p-10 text-center" style={{ minHeight: "400px" }}>
                <p className="text-sm">Sélectionnez un jouet dans la liste pour vérifier et valider sa migration.</p>
                {filteredToys.filter(t => t.status === "auto-migrable").length > 0 && (
                  <p className="text-xs text-blue-400/60 mt-3">
                    {filteredToys.filter(t => t.status === "auto-migrable").length} jouet(s) auto-migrables : sélectionnez-les et utilisez la migration groupée.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
        )
      )}
      
      <Modal
        isOpen={!!detailsModalToy}
        onClose={() => setDetailsModalToy(null)}
        title="Détails du jouet"
      >
        {detailsModalToy && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{detailsModalToy.nom}</h3>
              <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full border border-white/15">
                Thème : {detailsModalToy.themeName || detailsModalToy.themeId}
              </span>
            </div>

            {/* Données V2 si migré */}
            {detailsModalToy.status === "migrated" && detailsModalToy.v2_data && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-emerald-400">Données Migrées (V2) ✓</h4>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                  {detailsModalToy.v2_data.category_ids?.[0]?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Catégorie</span>
                      <span className="text-emerald-300 font-medium">
                        {detailsModalToy.v2_data.category_ids[0].name}
                        {detailsModalToy.v2_data.category_ids?.[1]?.name && <span className="text-emerald-400/60"> / {detailsModalToy.v2_data.category_ids[1].name}</span>}
                      </span>
                    </div>
                  )}
                  {detailsModalToy.v2_data.studio_ids?.[0]?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Studio</span>
                      <span className="text-emerald-300 font-medium">{detailsModalToy.v2_data.studio_ids[0].name}</span>
                    </div>
                  )}
                  {detailsModalToy.v2_data.franchise_ids?.[0]?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Franchise</span>
                      <span className="text-emerald-300 font-medium">{detailsModalToy.v2_data.franchise_ids[0].name}</span>
                    </div>
                  )}
                  {detailsModalToy.v2_data.license_ids?.[0]?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Licence</span>
                      <span className="text-emerald-300 font-medium">{detailsModalToy.v2_data.license_ids[0].name}</span>
                    </div>
                  )}
                  {detailsModalToy.v2_data.character_ids?.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Personnages</span>
                      <span className="text-emerald-300 font-medium">{detailsModalToy.v2_data.character_ids.map((c: any) => c.name).join(", ")}</span>
                    </div>
                  )}
                  {detailsModalToy.v2_data.location_ids?.[0]?.name && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Lieu</span>
                      <span className="text-emerald-300 font-medium">{detailsModalToy.v2_data.location_ids[0].name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Données legacy */}
            {(detailsModalToy.legacy?.categorie || detailsModalToy.legacy?.studio) && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-400">Données d'origine (V1)</h4>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-1.5">
                  {detailsModalToy.legacy?.categorie && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Catégorie</span>
                      <span className="text-gray-200">{detailsModalToy.legacy.categorie}</span>
                    </div>
                  )}
                  {detailsModalToy.legacy?.studio && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Studio</span>
                      <span className="text-gray-200">{detailsModalToy.legacy.studio}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            {(detailsModalToy.metadata?.numero || detailsModalToy.metadata?.nb_pieces || detailsModalToy.metadata?.release_date || detailsModalToy.metadata?.taille) && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Métadonnées</h4>
                <div className="flex flex-wrap gap-2">
                  {detailsModalToy.metadata?.numero && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">N° {detailsModalToy.metadata.numero}</span>}
                  {detailsModalToy.metadata?.nb_pieces && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">🧩 {detailsModalToy.metadata.nb_pieces} pcs</span>}
                  {detailsModalToy.metadata?.release_date && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">📅 {detailsModalToy.metadata.release_date}</span>}
                  {detailsModalToy.metadata?.taille && <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-gray-300">📐 {detailsModalToy.metadata.taille}</span>}
                </div>
              </div>
            )}

            {/* Champs personnalisés */}
            {detailsModalToy.custom_fields && Object.keys(detailsModalToy.custom_fields).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Champs personnalisés</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(detailsModalToy.custom_fields).map(([key, val]) => (
                    <span key={key} className="text-xs bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 text-purple-300">
                      {detailsModalToy.customFieldsDef?.find((f: any) => f.id === key)?.label || key} : {val as React.ReactNode}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col items-center justify-center text-center gap-1 hover:bg-white/8 transition-colors">
      <div className={`text-2xl font-bold ${cls}`}>{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

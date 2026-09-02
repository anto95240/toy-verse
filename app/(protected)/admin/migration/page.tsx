"use client";

/**
 * app/(protected)/admin/migration/page.tsx
 *
 * Interface de validation semi-guidée de la migration legacy → V2.
 * L'utilisateur valide ou rejette chaque suggestion jouet par jouet.
 * Design en Split-Pane (Liste à gauche, Éditeur à droite).
 */

import React from "react";
import { useMigration, type MigrationForm } from "@/hooks/admin/useMigration";
import SmartSelect from "@/components/ui/SmartSelect";
import SmartSelectMulti from "@/components/ui/SmartSelectMulti";

export default function MigrationPage() {
  const {
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
  } = useMigration();

  // =============================================================================
  // Helpers
  // =============================================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "migrated": return "☑️";
      case "auto-migrable": return "✅";
      case "needs-review": return "⚠️";
      case "unresolved": return "❌";
      default: return null;
    }
  };

  // =============================================================================
  // Rendu
  // =============================================================================

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* HEADER & STATS */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Migration des données</h1>
          <p className="text-sm text-gray-400 mt-1">
            Validez, corrigez et assignez le nouveau référentiel V2 aux anciens jouets.
          </p>
        </div>

        {notification && (
          <div className="px-4 py-3 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm">
            {notification}
          </div>
        )}

        {report && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <StatCard label="Total" value={report.stats.total} color="text-white" />
            <StatCard label="Déjà migrés (V2)" value={report.toys.filter(t => t.status === "migrated").length} color="text-green-400" />
            <StatCard label="Auto-migrables" value={report.toys.filter(t => t.status === "auto-migrable").length} color="text-blue-400" />
            <StatCard label="À valider" value={report.toys.filter(t => t.status === "needs-review").length} color="text-amber-400" />
            <StatCard label="Non résolus" value={report.toys.filter(t => t.status === "unresolved").length} color="text-red-400" />
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
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Analyse en cours...
        </div>
      )}

      {/* MAIN SPLIT-PANE */}
      {!loading && !error && report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PANNEAU GAUCHE : LISTE & FILTRES */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Filtres */}
            <div className="flex gap-2 flex-wrap">
              {(["needs-review", "auto-migrable", "unresolved", "migrated", "all"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setSelectedToyId(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s
                      ? "bg-white/20 text-white shadow-sm"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {s === "needs-review"   ? "⚠️ À valider"       : ""}
                  {s === "auto-migrable"  ? "✅ Auto-migrables"   : ""}
                  {s === "unresolved"     ? "❌ Non résolus"      : ""}
                  {s === "migrated"       ? "☑️ Déjà migrés"      : ""}
                  {s === "all"            ? "Tous"               : ""}
                </button>
              ))}
            </div>

            {/* Liste */}
            <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col h-[600px] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5 text-xs text-gray-400 font-medium">
                {filteredToys.length} jouet(s) affiché(s)
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredToys.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm italic">
                    Aucun jouet dans ce filtre.
                  </div>
                ) : (
                  filteredToys.map((toy) => (
                    <button
                      key={toy.toyId}
                      onClick={() => setSelectedToyId(toy.toyId)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedToyId === toy.toyId
                          ? "bg-blue-500/20 border-blue-500/50"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-medium text-sm text-white line-clamp-1">{toy.nom}</div>
                        <div className="shrink-0 mt-0.5" title={toy.status}>
                          {getStatusIcon(toy.status)}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                        {toy.legacy.categorie || "Aucune catégorie"} • {toy.legacy.studio || "Aucun studio"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PANNEAU DROITE : EDITEUR */}
          <div className="lg:col-span-8">
            {currentToy ? (
              <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm p-6 space-y-6 shadow-xl sticky top-6">
                
                {/* Info jouet */}
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{currentToy.nom}</h2>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-gray-300 font-medium">
                      Legacy
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5 flex gap-4">
                    <p>Catégorie : <span className="text-gray-200 font-mono">{currentToy.legacy.categorie ?? "—"}</span></p>
                    <p>Studio : <span className="text-gray-200 font-mono">{currentToy.legacy.studio || "—"}</span></p>
                  </div>
                </div>

                {/* Suggestions */}
                {currentToy.status !== "migrated" && currentToy.suggestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Suggestions de migration</h3>
                      <button
                        onClick={applySuggestions}
                        className="text-xs text-green-400 hover:text-green-300 border border-green-400/30 px-2 py-1 rounded transition-all bg-green-400/10 hover:bg-green-400/20"
                      >
                        Appliquer tout
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentToy.suggestions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-white/10 bg-black/20"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 uppercase">
                              {s.entityType}
                            </div>
                            <span className="font-medium text-sm text-white line-clamp-1">{s.name}</span>
                          </div>
                          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            s.level === "CERTAIN"  ? "bg-green-500/20 text-green-400"  :
                            s.level === "PROBABLE" ? "bg-amber-500/20 text-amber-400"  :
                                                     "bg-gray-500/20  text-gray-400"
                          }`}>
                            {s.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edition manuelle (Smart Selects) */}
                <div className="pt-2 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex justify-between items-center">
                    <span>Validation V2</span>
                    {currentToy.status === "migrated" && (
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Jouet déjà migré (Mode modification)</span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isPending}
                    />

                    <SmartSelect
                      id="subcategory"
                      entityType="category"
                      label="Sous-catégorie"
                      placeholder={form._v2_category ? `Sous-catégorie de ${form._v2_category.name}...` : "Catégorie requise..."}
                      value={form._v2_subcategory}
                      onChange={(item) => updateField("_v2_subcategory", item)}
                      disabled={isPending || !form._v2_category}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Bouton Appliquer */}
                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={handleApply}
                    disabled={isPending}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    {isPending ? "Application..." : "✅ Sauvegarder en base"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-[600px] border border-dashed border-white/20 rounded-xl bg-white/5 flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                <span className="text-4xl mb-4 opacity-50">👈</span>
                <p>Sélectionnez un jouet dans la liste de gauche pour vérifier ses informations de migration.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex flex-col items-center justify-center text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

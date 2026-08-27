"use client";

/**
 * app/(protected)/admin/referential/[entity]/ReferentialPageClient.tsx
 *
 * Composant client de la page de gestion d'un référentiel.
 * Affiche la liste/arborescence des entités et permet le CRUD inline.
 */

import React, { useState, useTransition } from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import {
  createReferentialEntity,
  updateReferentialEntity,
  archiveReferentialEntity,
  mergeReferentialEntities,
  type CreateEntityInput,
} from "@/app/actions/referential";

// =============================================================================
// Types
// =============================================================================

type BaseEntity = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  aliases?: string[];
  description?: string | null;
  children?: BaseEntity[];
};

interface ReferentialPageClientProps {
  entityType: ReferentialEntityKey;
  label: string;
  items: unknown[];
  tree: unknown[] | null;
}

// =============================================================================
// Composant
// =============================================================================

export default function ReferentialPageClient({
  entityType,
  label,
  items,
  tree,
}: ReferentialPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = (items as BaseEntity[]);
  const displayTree = (tree as BaseEntity[] | null);

  // Filtre de recherche
  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.aliases ?? []).some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function notify(type: "success" | "error", message: string) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  async function handleCreate(data: { name: string; description: string; aliases: string; parentId: string }) {
    const input: CreateEntityInput = {
      entityType,
      name: data.name,
      description: data.description || undefined,
      aliases: data.aliases.split(",").map((a) => a.trim()).filter(Boolean),
      parentId: data.parentId || null,
    };
    startTransition(async () => {
      const result = await createReferentialEntity(input);
      if (result.success) {
        notify("success", `"${data.name}" créé avec succès`);
        setShowForm(false);
      } else {
        notify("error", result.error);
      }
    });
  }

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Archiver "${name}" ? Les jouets liés ne seront pas modifiés.`)) return;
    startTransition(async () => {
      const result = await archiveReferentialEntity(entityType, id);
      if (result.success) notify("success", `"${name}" archivé`);
      else notify("error", result.error);
    });
  }

  async function handleMerge(targetId: string, targetName: string) {
    if (!mergeSource || mergeSource === targetId) { setMergeSource(null); return; }
    const sourceName = allItems.find((i) => i.id === mergeSource)?.name ?? mergeSource;
    if (!confirm(`Fusionner "${sourceName}" → "${targetName}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      const result = await mergeReferentialEntities(entityType, mergeSource, targetId);
      if (result.success) {
        notify("success", `"${sourceName}" fusionné dans "${targetName}"`);
        setMergeSource(null);
      } else {
        notify("error", result.error);
      }
    });
  }

  // =============================================================================
  // Rendu
  // =============================================================================

  return (
    <div className="max-w-4xl space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{label}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {allItems.length} entrée{allItems.length > 1 ? "s" : ""} ·{" "}
            {allItems.filter((i) => !i.active).length} archivée{allItems.filter((i) => !i.active).length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        >
          + Nouvelle entrée
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          notification.type === "success"
            ? "bg-green-500/20 border border-green-400/30 text-green-300"
            : "bg-red-500/20 border border-red-400/30 text-red-300"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Mode fusion */}
      {mergeSource && (
        <div className="px-4 py-3 rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300 text-sm">
          <span className="font-medium">Mode fusion actif :</span>{" "}
          &ldquo;{allItems.find((i) => i.id === mergeSource)?.name}&rdquo; →
          cliquez sur l&apos;entité cible pour fusionner.{" "}
          <button onClick={() => setMergeSource(null)} className="underline hover:no-underline ml-2">
            Annuler
          </button>
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <CreateForm
          entityType={entityType}
          allItems={allItems}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isPending={isPending}
        />
      )}

      {/* Recherche */}
      <input
        type="search"
        placeholder={`Rechercher dans ${label.toLowerCase()}...`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      />

      {/* Liste */}
      <div className="space-y-2">
        {displayTree && !searchQuery ? (
          <TreeList
            nodes={displayTree as BaseEntity[]}
            entityType={entityType}
            editingId={editingId}
            setEditingId={setEditingId}
            mergeSource={mergeSource}
            setMergeSource={setMergeSource}
            onArchive={handleArchive}
            onMerge={handleMerge}
            isPending={isPending}
            startTransition={startTransition}
            notify={notify}
            indent={0}
          />
        ) : (
          filteredItems.map((item) => (
            <EntityRow
              key={item.id}
              item={item}
              entityType={entityType}
              editingId={editingId}
              setEditingId={setEditingId}
              mergeSource={mergeSource}
              setMergeSource={setMergeSource}
              onArchive={handleArchive}
              onMerge={handleMerge}
              isPending={isPending}
              startTransition={startTransition}
              notify={notify}
            />
          ))
        )}

        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">
            {searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucune entrée. Cliquez sur "+ Nouvelle entrée" pour commencer.'}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sous-composants
// =============================================================================

function TreeList({
  nodes,
  entityType,
  indent,
  ...rest
}: {
  nodes: BaseEntity[];
  entityType: ReferentialEntityKey;
  indent: number;
} & Omit<React.ComponentProps<typeof EntityRow>, "item">) {
  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          <div style={{ paddingLeft: `${indent * 24}px` }}>
            <EntityRow item={node} entityType={entityType} {...rest} />
          </div>
          {node.children && node.children.length > 0 && (
            <TreeList nodes={node.children} entityType={entityType} indent={indent + 1} {...rest} />
          )}
        </React.Fragment>
      ))}
    </>
  );
}

function EntityRow({
  item,
  entityType,
  editingId,
  setEditingId,
  mergeSource,
  setMergeSource,
  onArchive,
  onMerge,
  isPending,
  startTransition,
  notify,
}: {
  item: BaseEntity;
  entityType: ReferentialEntityKey;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  mergeSource: string | null;
  setMergeSource: (id: string | null) => void;
  onArchive: (id: string, name: string) => void;
  onMerge: (id: string, name: string) => void;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
  notify: (type: "success" | "error", message: string) => void;
}) {
  const isEditing   = editingId === item.id;
  const isMergeSrc  = mergeSource === item.id;
  const isMergeDest = mergeSource !== null && mergeSource !== item.id;

  const [editName,        setEditName]        = useState(item.name);
  const [editDescription, setEditDescription] = useState(item.description ?? "");
  const [editAliases,     setEditAliases]     = useState((item.aliases ?? []).join(", "));

  async function handleSave() {
    startTransition(async () => {
      const result = await updateReferentialEntity({
        entityType,
        id: item.id,
        name: editName,
        description: editDescription || undefined,
        aliases: editAliases.split(",").map((a) => a.trim()).filter(Boolean),
      });
      if (result.success) {
        notify("success", `"${editName}" mis à jour`);
        setEditingId(null);
      } else {
        notify("error", result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-4 space-y-3">
        <input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="w-full px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Nom"
        />
        <input
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Description (optionnel)"
        />
        <input
          value={editAliases}
          onChange={(e) => setEditAliases(e.target.value)}
          className="w-full px-3 py-1.5 rounded border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Aliases (séparés par des virgules)"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isPending || !editName.trim()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-all disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded text-xs transition-all"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
        isMergeSrc
          ? "border-amber-400/50 bg-amber-500/10"
          : isMergeDest
          ? "border-dashed border-green-400/30 bg-green-500/5 hover:border-green-400/60 cursor-pointer"
          : item.active
          ? "border-white/10 bg-white/5 hover:bg-white/10"
          : "border-white/5 bg-white/[0.02] opacity-50"
      }`}
      onClick={isMergeDest ? () => onMerge(item.id, item.name) : undefined}
    >
      {/* Info principale */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium text-sm ${item.active ? "text-white" : "text-gray-500 line-through"}`}>
            {item.name}
          </span>
          {!item.active && (
            <span className="text-xs bg-gray-500/20 text-gray-400 px-1.5 py-0.5 rounded">Archivé</span>
          )}
          {isMergeSrc && (
            <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Source fusion</span>
          )}
        </div>
        {(item.aliases ?? []).length > 0 && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            Aliases : {(item.aliases ?? []).join(", ")}
          </p>
        )}
        {item.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>
        )}
      </div>

      {/* Slug */}
      <span className="text-xs text-gray-600 font-mono shrink-0 hidden md:block">{item.slug}</span>

      {/* Actions */}
      {!isMergeDest && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditingId(item.id)}
            disabled={isPending}
            title="Modifier"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all text-sm"
          >
            ✏️
          </button>
          <button
            onClick={() => setMergeSource(isMergeSrc ? null : item.id)}
            disabled={isPending}
            title="Fusionner avec..."
            className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all text-sm"
          >
            🔀
          </button>
          {item.active ? (
            <button
              onClick={() => onArchive(item.id, item.name)}
              disabled={isPending}
              title="Archiver"
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all text-sm"
            >
              🗄️
            </button>
          ) : (
            <button
              onClick={() => startTransition(async () => {
                const result = await updateReferentialEntity({ entityType, id: item.id, active: true });
                if (result.success) notify("success", `"${item.name}" restauré`);
                else notify("error", result.error);
              })}
              disabled={isPending}
              title="Restaurer"
              className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-all text-sm"
            >
              ♻️
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CreateForm({
  entityType,
  allItems,
  onSubmit,
  onCancel,
  isPending,
}: {
  entityType: ReferentialEntityKey;
  allItems: BaseEntity[];
  onSubmit: (data: { name: string; description: string; aliases: string; parentId: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [aliases, setAliases]         = useState("");
  const [parentId, setParentId]       = useState("");

  const hasParent = ["category", "studio", "license", "franchise", "location"].includes(entityType);
  const parentItems = allItems.filter((i) => i.active);

  return (
    <div className="rounded-lg border border-green-400/30 bg-green-500/5 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-green-300">Nouvelle entrée</h3>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom *"
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        autoFocus
      />

      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnel)"
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
      />

      <input
        value={aliases}
        onChange={(e) => setAliases(e.target.value)}
        placeholder="Aliases séparés par des virgules (ex: Figurines, Figure)"
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
      />

      {hasParent && (
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-white/20 bg-gray-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          <option value="">— Pas de parent (racine) —</option>
          {parentItems.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onSubmit({ name, description, aliases, parentId })}
          disabled={isPending || !name.trim()}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        >
          {isPending ? "Création..." : "Créer"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-all"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

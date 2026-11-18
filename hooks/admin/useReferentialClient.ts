import { useState, useTransition } from "react";
import type { ReferentialEntityKey } from "@/types/theme";
import {
  createReferentialEntity,
  archiveReferentialEntity,
  mergeReferentialEntities,
  type CreateEntityInput,
} from "@/app/actions/referential";

export type BaseEntity = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  aliases?: string[];
  description?: string | null;
  children?: BaseEntity[];
};

export function useReferentialClient(entityType: ReferentialEntityKey, items: unknown[]) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mergeSource, setMergeSource] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = items as BaseEntity[];

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

  return {
    isPending,
    startTransition,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    mergeSource,
    setMergeSource,
    notification,
    searchQuery,
    setSearchQuery,
    notify,
    handleCreate,
    handleArchive,
    handleMerge,
    allItems,
    filteredItems,
  };
}

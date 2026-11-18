import React from "react";
import type { BaseEntity } from "@/hooks/admin/useReferentialClient";

interface ReferentialHeaderProps {
  label: string;
  allItems: BaseEntity[];
  setShowForm: (show: boolean) => void;
  isPending: boolean;
  notification: { type: "success" | "error"; message: string } | null;
  mergeSource: string | null;
  setMergeSource: (id: string | null) => void;
}

export function ReferentialHeader({
  label,
  allItems,
  setShowForm,
  isPending,
  notification,
  mergeSource,
  setMergeSource,
}: ReferentialHeaderProps) {
  const activeCount = allItems.length;
  const archivedCount = allItems.filter((i) => !i.active).length;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{label}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {activeCount} entrée{activeCount > 1 ? "s" : ""} ·{" "}
            {archivedCount} archivée{archivedCount > 1 ? "s" : ""}
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

      {notification && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium ${
            notification.type === "success"
              ? "bg-green-500/20 border border-green-400/30 text-green-300"
              : "bg-red-500/20 border border-red-400/30 text-red-300"
          }`}
        >
          {notification.message}
        </div>
      )}

      {mergeSource && (
        <div className="px-4 py-3 rounded-lg border border-amber-400/30 bg-amber-500/10 text-amber-300 text-sm">
          <span className="font-medium">Mode fusion actif :</span>{" "}
          &ldquo;{allItems.find((i) => i.id === mergeSource)?.name}&rdquo; →
          cliquez sur l&apos;entité cible pour fusionner.{" "}
          <button
            onClick={() => setMergeSource(null)}
            className="underline hover:no-underline ml-2"
          >
            Annuler
          </button>
        </div>
      )}
    </>
  );
}

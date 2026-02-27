"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation, faTrash, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { getSupabaseClient } from "@/lib/supabase/client";
import { deleteUserAccount } from "@/app/actions/actions";
import SectionWrapper from "./SectionWrapper";

interface DangerZoneProps {
  expanded: string | null;
  toggle: (id: string) => void;
}

export default function DangerZone({ expanded, toggle }: DangerZoneProps) {
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "SUPPRIMER") return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await deleteUserAccount();
      if (!response.success) throw new Error(response.error);
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = "/auth";
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression.");
      setIsDeleting(false);
    }
  };

  return (
    <SectionWrapper id="danger" icon={faTriangleExclamation} title="Zone de danger" expanded={expanded} toggle={toggle}>
      <div className="p-5 pt-0 space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive space-y-3">
          <h4 className="font-bold flex items-center gap-2"><FontAwesomeIcon icon={faTrash} />Supprimer mon compte définitivement</h4>
          <p className="text-sm">Attention, cette action est <strong>irréversible</strong>.</p>
          <div className="pt-3 border-t border-destructive/20 space-y-3">
            <label className="text-sm font-semibold">Veuillez taper <span className="font-bold select-none">SUPPRIMER</span> pour confirmer :</label>
            <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="SUPPRIMER" disabled={isDeleting} className="w-full px-3 py-2 border border-destructive/30 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-destructive" />
            {deleteError && <p className="text-sm font-bold flex items-center gap-2 bg-destructive text-destructive-foreground p-2 rounded-lg"><FontAwesomeIcon icon={faExclamationCircle} /> {deleteError}</p>}
            <div className="flex justify-end pt-2">
              <button onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }} disabled={deleteConfirmText !== "SUPPRIMER" || isDeleting} className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold disabled:opacity-50 transition-colors">
                {isDeleting ? "Suppression en cours..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
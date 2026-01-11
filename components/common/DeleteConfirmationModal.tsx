"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Supprimer le jouet",
  message = "Êtes-vous sûr de vouloir supprimer ce jouet ? Cette action est irréversible.",
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-second/90 to-bg-primary/90 z-0"></div>

        <div className="relative z-10 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-3xl text-red-500"
            />
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 font-medium text-sm disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  Supprimer
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="ferme la popup"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </div>
    </div>
  );
}

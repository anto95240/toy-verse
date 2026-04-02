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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-[70] p-4 animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/50 shadow-2xl animate-scale-in bg-card">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20 shadow-lg">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-3xl text-destructive"
            />
          </div>

          <h3 className="text-2xl font-title font-bold text-foreground mb-3">{title}</h3>

          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="btn-secondary flex-1 py-3"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="btn-destructive flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
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
            className="absolute top-4 right-4 icon-btn"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      </div>
    </div>
  );
}

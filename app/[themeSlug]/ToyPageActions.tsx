"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { Toy } from "@/types/theme";

import ToyModal from "@/components/toys/ToyModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

interface ToyPageActionsProps {
  isOpen: boolean;
  themeId: string;
  userId: string;
  toyToEdit: Toy | null;
  toyToDeleteId: string | null;
  isDeleting: boolean;
  toys: Toy[];
  searchResults: (Toy & { theme_name: string })[];
  onCloseModal: () => void;
  onSaveToy: (toy: Toy) => void;
  onConfirmDelete: () => Promise<void>;
  onCloseDeleteModal: () => void;
}

export default function ToyPageActions({
  isOpen,
  themeId,
  userId,
  toyToEdit,
  toyToDeleteId,
  isDeleting,
  toys,
  searchResults,
  onCloseModal,
  onSaveToy,
  onConfirmDelete,
  onCloseDeleteModal,
}: ToyPageActionsProps) {
  return (
    <>
      {/* Add Button (Desktop) */}
      <div className="hidden md:block fixed bottom-20 right-6 md:bottom-8 z-40 animate-in zoom-in duration-300">
        <button
          onClick={() => {
            onCloseModal();
          }}
          aria-label="Ajouter un jouet"
          className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
        >
          <FontAwesomeIcon icon={faPlus} className="text-2xl" />
        </button>
      </div>

      {/* Toy Modal */}
      {isOpen && (
        <ToyModal
          isOpen={isOpen}
          themeId={themeId}
          userId={userId}
          toy={toyToEdit}
          onClose={onCloseModal}
          onSave={onSaveToy}
        />
      )}

      {/* Delete Confirmation */}
      {toyToDeleteId && (
        <DeleteConfirmationModal
          isOpen={!!toyToDeleteId}
          title="Supprimer ce jouet ?"
          message="Êtes-vous sûr de vouloir supprimer ce jouet ? Cette action est irréversible."
          isDeleting={isDeleting}
          onConfirm={onConfirmDelete}
          onClose={onCloseDeleteModal}
        />
      )}
    </>
  );
}

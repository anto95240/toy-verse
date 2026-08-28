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
  themeName: string;
  themeProfileId?: string | null;
  toyToEdit: Toy | null;
  toyToDeleteId: string | null;
  isDeleting: boolean;
  toys: Toy[];
  searchResults: (Toy & { theme_name: string })[];
  onCloseModal: () => void;
  onOpenModal: () => void;
  onSaveToy: (toy: Toy) => void;
  onConfirmDelete: () => Promise<void>;
  onCloseDeleteModal: () => void;
}

export default function ToyPageActions({
  isOpen,
  themeId,
  userId,
  themeName,
  themeProfileId,
  toyToEdit,
  toyToDeleteId,
  isDeleting,
  onCloseModal,
  onOpenModal,
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
            onOpenModal();
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
          onClose={onCloseModal}
          themeId={themeId}
          themeName={themeName}
          themeProfileId={themeProfileId}
          userId={userId}
          toy={toyToEdit}
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

"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  loading,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-second via-bg-second to-bg-primary z-0" />

        <div className="relative p-6 border-b border-white/10 shrink-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-btn-add/20 to-btn-choix/20 rounded-t-2xl opacity-50" />
          <div className="relative flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-btn-add to-btn-choix bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 transition-all disabled:opacity-50 group"
              aria-label="Fermer"
            >
              <FontAwesomeIcon
                icon={faXmark}
                className="w-5 h-5 text-text-prim group-hover:text-red-400"
              />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 z-10 relative scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {children}
        </div>

        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-btn-add/20 via-transparent to-btn-choix/20 pointer-events-none z-20" />
      </div>
    </div>
  );
}

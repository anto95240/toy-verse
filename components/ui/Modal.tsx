"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative w-full sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl bg-card text-card-foreground">
        <div className="relative p-4 border-b border-border shrink-0">
          <div className="relative flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-destructive/15 hover:text-destructive transition-all disabled:opacity-50"
              aria-label="Fermer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

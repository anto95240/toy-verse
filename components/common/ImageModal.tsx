"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  toyName: string;
  onClose: () => void;
}

/**
 * ImageModal Component
 * Displays an enlarged image in a lightbox modal
 * Uses React Portal to render at document root level
 * Can be closed by clicking outside, ESC key, or close button
 */
export default function ImageModal({
  isOpen,
  imageUrl,
  toyName,
  onClose,
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Empêcher le scroll du body
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[10000] icon-btn bg-white/10 hover:bg-white/20 text-white"
          aria-label="Fermer"
        >
          <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
        </button>

        {/* Image container */}
        <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          <Image
            src={imageUrl}
            alt={toyName}
            fill
            className="object-contain"
            onClick={onClose}
            onLoadingComplete={() => setIsLoading(false)}
            priority
          />
        </div>

        {/* Toy name at bottom */}
        <div className="absolute bottom-12 sm:bottom-16 left-4 right-4 text-center pointer-events-none">
          <p className="text-white text-sm sm:text-lg font-semibold line-clamp-2 drop-shadow-lg">
            {toyName}
          </p>
        </div>

        {/* Click hint */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/50 pointer-events-none">
          Cliquez pour fermer • ESC
        </div>
      </div>
    </div>
  );

  // Renderiser au niveau du document body via Portal
  if (typeof document !== "undefined") {
    return ReactDOM.createPortal(modalContent, document.body);
  }

  return null;
}

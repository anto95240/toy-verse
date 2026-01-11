"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUpload, 
  faLink, 
  faImage, 
  faTimes, 
  faCheck,
  faCamera 
} from "@fortawesome/free-solid-svg-icons";
import { FormInput } from "@/components/ui/FormInput";

interface ImageUploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File | null) => void;
  loading: boolean;
}

export default function ImageUploadPopup({
  isOpen,
  onClose,
  onFileSelect,
  loading,
}: ImageUploadPopupProps) {
  const [activeTab, setActiveTab] = useState<"local" | "url">("local");
  const [urlInput, setUrlInput] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-5 border-b border-border bg-muted/20">
          <h3 className="text-lg font-bold text-foreground">Ajouter une image</h3>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            aria-label="Fermer"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="flex p-2 gap-2 bg-muted/40">
          <button
            onClick={() => setActiveTab("local")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "local"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <FontAwesomeIcon icon={faUpload} /> Appareil / Fichier
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "url"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <FontAwesomeIcon icon={faLink} /> Via URL
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === "local" ? (
            <div className="space-y-4">
              
              <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors bg-blue-50/50 dark:bg-blue-900/10">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FontAwesomeIcon icon={faCamera} className="text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Prendre une photo</h4>
                  <p className="text-sm text-muted-foreground">Utiliser l&apos;appareil photo</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>

              <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <FontAwesomeIcon icon={faImage} className="text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Importer un fichier</h4>
                  <p className="text-sm text-muted-foreground">Depuis la galerie ou les documents</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>

            </div>
          ) : (
            <div className="space-y-6 pt-2">
              <FormInput
                id="url-input"
                label="Collez l&apos;adresse de l&apos;image"
                placeholder="https://..."
                value={urlInput}
                onChange={setUrlInput}
              />
              <button 
                onClick={() => onClose()} 
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faCheck} /> Valider l&apos;URL
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
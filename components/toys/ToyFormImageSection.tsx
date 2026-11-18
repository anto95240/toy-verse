import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPlus } from "@fortawesome/free-solid-svg-icons";

interface ToyFormImageSectionProps {
  previewUrl: string | null;
  photoLater: boolean;
  setPhotoLater: (val: boolean) => void;
  setShowImagePopup: (val: boolean) => void;
}

export function ToyFormImageSection({
  previewUrl,
  photoLater,
  setPhotoLater,
  setShowImagePopup,
}: ToyFormImageSectionProps) {
  return (
    <div className="pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <FontAwesomeIcon icon={faImage} />
          </div>
          Photo du jouet
        </label>
      </div>

      {!previewUrl ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowImagePopup(true)}
            disabled={photoLater}
            className={`w-full aspect-[4/3] flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl transition-all ${
              photoLater
                ? "border-border/50 bg-secondary/20 cursor-not-allowed opacity-50"
                : "border-border hover:border-primary/50 hover:bg-secondary/30"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FontAwesomeIcon icon={faPlus} className="text-xl" />
            </div>
            <span className="text-sm font-medium text-foreground">Ajouter une photo</span>
          </button>
          
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-colors">
            <input
              type="checkbox"
              checked={photoLater}
              onChange={(e) => setPhotoLater(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary bg-background"
            />
            <span className="text-sm text-foreground">Ajouter la photo plus tard</span>
          </label>
        </div>
      ) : (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-border shadow-sm group">
          <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowImagePopup(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-sm font-medium transition-colors"
            >
              Modifier la photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

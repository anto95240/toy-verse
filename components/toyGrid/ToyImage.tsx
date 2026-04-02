import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faExpand } from "@fortawesome/free-solid-svg-icons";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import ImageModal from "@/components/common/ImageModal";
import type { ToyImageProps } from "@/types/toyGrid";

export default function ToyImage({
  toy,
  toyImageUrls,
  currentUserId,
}: ToyImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { imageUrl, isLoading, hasError } = useSignedUrl(
    toy,
    toyImageUrls,
    currentUserId
  );

  if (isLoading) {
    return (
      <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 flex flex-col items-center justify-center border rounded animate-pulse">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div className="text-gray-500 text-xs">Chargement...</div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-400 border rounded">
        <FontAwesomeIcon icon={faImage} className="text-xl sm:text-2xl mb-2" />
        <span className="text-xs text-center px-2">
          {hasError ? "Image non trouvée" : "Pas d'image"}
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative w-36 h-36 sm:w-48 sm:h-48 group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsModalOpen(true);
          }
        }}
      >
        <Image
          src={imageUrl}
          alt={toy.nom}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            if (target.parentElement) {
              target.parentElement.innerHTML = `
                <div class="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-400 border rounded">
                  <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs">Erreur</span>
                </div>
              `;
            }
          }}
        />

        {/* Expand icon on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center rounded">
          <FontAwesomeIcon
            icon={faExpand}
            className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          />
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={imageUrl}
        toyName={toy.nom}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
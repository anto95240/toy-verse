"use client";

import React from "react";
import Image from "next/image";
import { useSignedUrl } from "@/hooks/useSignedUrl";
import type { Toy } from "@/types/theme";

interface SearchSuggestionImageProps {
  toy: Toy;
  currentUserId?: string;
  onError?: () => void;
}

export default function SearchSuggestionImage({
  toy,
  currentUserId,
  onError,
}: SearchSuggestionImageProps) {
  const { imageUrl, isLoading, hasError } = useSignedUrl(toy, {}, currentUserId);

  if (isLoading) {
    return (
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden border border-primary/30 animate-pulse">
        <div className="w-3 h-3 border border-primary/50 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden border border-primary/30 font-bold text-sm text-primary">
        <span>{toy.nom.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={toy.nom}
      width={56}
      height={56}
      className="w-14 h-14 rounded-lg object-cover border border-primary/30"
      onError={() => {
        if (onError) onError();
      }}
    />
  );
}

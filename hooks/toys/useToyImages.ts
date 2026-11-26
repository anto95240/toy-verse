import { useState, useEffect } from "react";
import { getToyImageUrls } from "@/utils/imageUtils";
import type { Toy } from "@/types/theme";

export function useToyImages(toys: Toy[], userId?: string) {
  const [toyImageUrls, setToyImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      if (!toys.length || !userId) return;
      const urls = await getToyImageUrls(toys, userId);
      if (!isMounted) return;
      const next: Record<string, string> = {};
      for (const [id, url] of Object.entries(urls)) {
        if (url) next[id] = url;
      }
      if (Object.keys(next).length === 0) return;
      setToyImageUrls((prev) => ({ ...prev, ...next }));
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [toys, userId]);

  const updateToyImageUrl = (toyId: string, url: string | null) => {
    if (!url) {
      removeToyImageUrl(toyId);
      return;
    }
    setToyImageUrls((prev) => ({ ...prev, [toyId]: url }));
  };

  const removeToyImageUrl = (toyId: string) => {
    setToyImageUrls((prev) => {
      const newUrls = { ...prev };
      delete newUrls[toyId];
      return newUrls;
    });
  };

  return { toyImageUrls, updateToyImageUrl, removeToyImageUrl };
}

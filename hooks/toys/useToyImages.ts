import { useState, useEffect } from "react";
import { getToyImageUrl } from "@/utils/imageUtils";
import type { Toy } from "@/types/theme";

export function useToyImages(toys: Toy[], userId?: string) {
  const [toyImageUrls, setToyImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      if (!toys.length || !userId) return;

      const urls: Record<string, string> = {};
      const BATCH_SIZE = 8; // Paralléliser 8 images à la fois au lieu de tout

      // Process toys in batches for better performance
      for (let i = 0; i < toys.length; i += BATCH_SIZE) {
        const batch = toys.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (toy) => {
            if (toy.photo_url) {
              if (toyImageUrls[toy.id]) {
                urls[toy.id] = toyImageUrls[toy.id];
                return;
              }
              const signedUrl = await getToyImageUrl(
                toy.id,
                toy.photo_url,
                userId
              );
              if (signedUrl) {
                urls[toy.id] = signedUrl;
              }
            }
          })
        );

        // Update progressively as batches complete
        if (isMounted && Object.keys(urls).length > 0) {
          setToyImageUrls((prev) => ({ ...prev, ...urls }));
        }
      }

      if (isMounted && Object.keys(urls).length > 0) {
        setToyImageUrls((prev) => {
          const hasChanges = Object.keys(urls).some(
            (key) => urls[key] !== prev[key]
          );
          if (
            hasChanges ||
            Object.keys(urls).length !== Object.keys(prev).length
          ) {
            return { ...prev, ...urls };
          }
          return prev;
        });
      }
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

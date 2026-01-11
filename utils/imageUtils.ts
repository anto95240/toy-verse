import { getSupabaseClient } from "@/lib/supabase/client";

interface ImageCache {
  [toyId: string]: {
    url: string;
    timestamp: number;
  };
}

const imageCache: ImageCache = {};
const CACHE_DURATION = 3 * 60 * 60 * 1000;

export async function getToyImageUrl(
  toyId: string,
  photo_url?: string,
  userId?: string
): Promise<string | null> {
  if (!photo_url) return null;

  const supabase = getSupabaseClient();
  const now = Date.now();

  if (imageCache[toyId] && now - imageCache[toyId].timestamp < CACHE_DURATION) {
    return imageCache[toyId].url;
  }

  try {
    let storagePath = photo_url;

    if (!photo_url.startsWith("toys/") && !photo_url.startsWith("themes/")) {
      if (userId) {
        const isTheme =
          photo_url.includes("themes") || photo_url.includes("Themes");
        storagePath = isTheme
          ? `themes/${userId}/${photo_url}`
          : `toys/${userId}/${photo_url}`;
      }
    }

    const { data, error } = await supabase.storage
      .from("toys-images")
      .createSignedUrl(storagePath, 3600);

    if (error) {
      console.error(
        `Erreur lors de la génération de l'URL signée pour ${toyId}:`,
        error
      );
      return null;
    }

    if (!data?.signedUrl) {
      console.warn(`Pas d'URL signée générée pour ${toyId}`);
      return null;
    }

    imageCache[toyId] = {
      url: data.signedUrl,
      timestamp: now,
    };

    return data.signedUrl;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de l'image pour ${toyId}:`,
      error
    );
    return null;
  }
}

export async function getToyImageUrls(
  toys: Array<{ id: string; photo_url?: string }>,
  userId?: string
): Promise<Record<string, string | null>> {
  const imageUrls: Record<string, string | null> = {};

  const BATCH_SIZE = 5;
  for (let i = 0; i < toys.length; i += BATCH_SIZE) {
    const batch = toys.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (toy) => {
      const url = await getToyImageUrl(toy.id, toy.photo_url, userId);
      return { id: toy.id, url };
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ id, url }) => {
      imageUrls[id] = url;
    });
  }

  return imageUrls;
}

export function clearExpiredImageCache() {
  const now = Date.now();
  Object.keys(imageCache).forEach((toyId) => {
    if (now - imageCache[toyId].timestamp > CACHE_DURATION) {
      delete imageCache[toyId];
    }
  });
}

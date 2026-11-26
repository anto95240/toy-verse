import { getSupabaseClient } from "@/lib/supabase/client";

interface ImageCache {
  [cacheKey: string]: {
    url: string;
    timestamp: number;
  };
}

const imageCache: ImageCache = {};
const CACHE_DURATION = 3 * 60 * 60 * 1000;

export function resolveStoredPath(photoUrl: string, userId?: string): string {
  if (!photoUrl || photoUrl.startsWith("http")) return photoUrl;
  if (photoUrl.startsWith("toys/") || photoUrl.startsWith("themes/")) return photoUrl;
  if (userId) {
    const isTheme = photoUrl.includes("themes") || photoUrl.includes("Themes");
    return isTheme ? `themes/${userId}/${photoUrl}` : `toys/${userId}/${photoUrl}`;
  }
  return photoUrl;
}

/** Une seule requête Storage pour signer plusieurs chemins. */
export async function signStoragePaths(paths: string[]): Promise<Map<string, string>> {
  const supabase = getSupabaseClient();
  const now = Date.now();
  const signed = new Map<string, string>();
  const missing: string[] = [];

  for (const path of paths) {
    if (!path) continue;
    if (path.startsWith("http")) {
      signed.set(path, path);
      continue;
    }
    const cached = imageCache[path];
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      signed.set(path, cached.url);
    } else {
      missing.push(path);
    }
  }

  const unique = [...new Set(missing)];
  if (unique.length === 0) return signed;

  const { data, error } = await supabase.storage
    .from("toys-images")
    .createSignedUrls(unique, 7200);

  if (error || !data) return signed;

  data.forEach((item, index) => {
    const path = unique[index];
    if (!path || !item.signedUrl) return;
    imageCache[path] = { url: item.signedUrl, timestamp: now };
    signed.set(path, item.signedUrl);
  });

  return signed;
}

export async function getToyImageUrl(
  toyId: string,
  photo_url?: string,
  userId?: string
): Promise<string | null> {
  if (!photo_url) return null;

  try {
    const storagePath = resolveStoredPath(photo_url, userId);
    const signed = await signStoragePaths([storagePath]);
    const signedUrl = signed.get(storagePath) ?? null;
    if (!signedUrl) {
      console.warn(`Pas d'URL signée générée pour ${toyId}`);
      return null;
    }
    return signedUrl;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'image pour ${toyId}:`, error);
    return null;
  }
}

export async function getToyImageUrls(
  toys: Array<{ id: string; photo_url?: string | null }>,
  userId?: string
): Promise<Record<string, string | null>> {
  const imageUrls: Record<string, string | null> = {};
  const entries = toys.flatMap((toy) =>
    toy.photo_url ? [{ id: toy.id, path: resolveStoredPath(toy.photo_url, userId) }] : []
  );

  const signed = await signStoragePaths(entries.map((entry) => entry.path));
  for (const entry of entries) {
    imageUrls[entry.id] = signed.get(entry.path) ?? null;
  }
  return imageUrls;
}

export function clearExpiredImageCache() {
  const now = Date.now();
  Object.keys(imageCache).forEach((key) => {
    if (now - imageCache[key].timestamp > CACHE_DURATION) {
      delete imageCache[key];
    }
  });
}

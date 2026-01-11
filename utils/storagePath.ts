export function buildStoragePath(
  photoUrl: string,
  userId?: string,
  type?: "toys" | "themes"
): string {
  if (!photoUrl) return "";

  let cleanPath = photoUrl.replace(/^\/+/, "");

  if (cleanPath.startsWith("toys-images/")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("toys/") || cleanPath.startsWith("themes/")) {
    return cleanPath;
  }

  if (userId && type && !cleanPath.includes("/")) {
    return `${type}/${userId}/${cleanPath}`;
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i;
  const startsWithUuid = uuidRegex.test(cleanPath);

  if (startsWithUuid) {
    return `toys/${cleanPath}`;
  }

  if (!userId) {
    return cleanPath;
  }

  const detectedType =
    type ||
    (cleanPath.includes("themes") || cleanPath.includes("Themes")
      ? "themes"
      : "toys");
  return `${detectedType}/${userId}/${cleanPath}`;
}

export const signedUrlsCache = new Map<
  string,
  { url: string; expires: number }
>();
export const pendingRequests = new Map<string, Promise<string | null>>();

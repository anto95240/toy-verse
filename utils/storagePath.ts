
export function buildStoragePath(photoUrl: string, userId?: string): string {
  if (!photoUrl) return ''

  let cleanPath = photoUrl.replace(/^\/+/, '')

  // Si le chemin commence déjà par toys-images, on le retourne tel quel
  if (cleanPath.startsWith('toys-images/')) {
    return cleanPath
  }

  // Compatibilité avec l'ancienne structure
  if (cleanPath.startsWith('toys/') || cleanPath.startsWith('theme/')) {
    return cleanPath
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i
  const startsWithUuid = uuidRegex.test(cleanPath)
  
  if (startsWithUuid) {
    return `toys/${cleanPath}`
  }

  if (!userId) {
    return cleanPath
  }

  // Nouvelle structure avec userId
  if (cleanPath.includes('theme') || cleanPath.includes('Theme')) {
    return `toys-images/theme/${userId}/${cleanPath}`
  } else {
    return `toys-images/toy/${userId}/${cleanPath}`
  }
}

export const signedUrlsCache = new Map<string, { url: string; expires: number }>()
export const pendingRequests = new Map<string, Promise<string | null>>()

export function buildStoragePath(photoUrl: string, userId?: string): string {
  if (!photoUrl) return ''

  let cleanPath = photoUrl.replace(/^\/+/, '')

  // Si le chemin commence déjà par toys/ ou themes/ avec userId, le retourner tel quel
  if (cleanPath.startsWith('toys/') && cleanPath.includes('/') && userId) {
    const pathParts = cleanPath.split('/')
    if (pathParts.length >= 2 && pathParts[1] === userId) {
      return cleanPath
    }
  }
  
  if (cleanPath.startsWith('themes/') && cleanPath.includes('/') && userId) {
    const pathParts = cleanPath.split('/')
    if (pathParts.length >= 2 && pathParts[1] === userId) {
      return cleanPath
    }
  }

  // Ancienne logique pour compatibilité
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

  if (cleanPath.includes('theme') || cleanPath.includes('Theme')) {
    return `themes/${userId}/${cleanPath}`
  } else {
    return `toys/${userId}/${cleanPath}`
  }
}

export const signedUrlsCache = new Map<string, { url: string; expires: number }>()
export const pendingRequests = new Map<string, Promise<string | null>>()
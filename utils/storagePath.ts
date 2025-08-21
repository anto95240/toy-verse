
export function buildStoragePath(photoUrl: string, userId?: string, type?: 'toys' | 'themes'): string {
  if (!photoUrl) return ''

  let cleanPath = photoUrl.replace(/^\/+/, '')

  // Si le chemin commence déjà par toys-images, on le retourne tel quel
  if (cleanPath.startsWith('toys-images/')) {
    return cleanPath
  }

  // Compatibilité avec l'ancienne structure
  if (cleanPath.startsWith('toys/') || cleanPath.startsWith('themes/')) {
    return cleanPath
  }

  // Si c'est juste un nom de fichier et qu'on a userId et type
  if (userId && type && !cleanPath.includes('/')) {
    return `${type}/${userId}/${cleanPath}`
  }

  // Pour les anciens chemins avec UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//i
  const startsWithUuid = uuidRegex.test(cleanPath)
  
  if (startsWithUuid) {
    return `toys/${cleanPath}`
  }

  if (!userId) {
    return cleanPath
  }

  // Nouvelle structure avec userId - déterminer le type basé sur le contexte
  const detectedType = type || (cleanPath.includes('themes') || cleanPath.includes('Themes') ? 'themes' : 'toys')
  return `${detectedType}/${userId}/${cleanPath}`
}

export const signedUrlsCache = new Map<string, { url: string; expires: number }>()
export const pendingRequests = new Map<string, Promise<string | null>>()
